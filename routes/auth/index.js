const db = require('../models/index');
const User = db.user;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const stripe = require('../middlewares/stripe');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Prepare Core Router
let app = express.Router();

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  // Username

  // console.log('xxxxxxxxxxxxxxxxxxxxxx');
  // Check if req.body.email is a valid email address
  if (
    !req.body.email ||
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(req.body.email)
  ) {
    return res.status(400).json({
      message: 'Please enter a valid email address',
    });
  }

  // check if req.body.lname is a valid last name
  if (!req.body.lname || !/^[a-zA-Z]+$/.test(req.body.lname)) {
    return res.status(400).json({
      message: 'Please enter a valid last name',
    });
  }

  // check if req.body.fname is a valid first name
  if (!req.body.fname || !/^[A-Za-z]+$/.test(req.body.fname)) {
    return res.status(400).json({
      message: 'Please enter a valid first name',
    });
  }

  // Check if req.body.password is at least 6 characters long
  if (!req.body.password || req.body.password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long',
    });
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      res.status(400).json({
        message: 'Failed! Email is already in use!',
      });
      return;
    }

    next();
  } catch (err) {
    console.log('checkMailError: ', err);
    if (err) {
      res.status(500).json({
        message: err,
      });
      return;
    }
  }
};

const getOrgInfobyUserId = async (_id) => {
  try {
    await User.find({ _id: _id, 'orgInfo.userId': _id })
      .sort({ 'orgInfo.created': 1 })
      .toArray();
  } catch (err) {}
};

const signup = async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      email: `${req.body.email}`,
      name: `${req.body.fname} ${req.body.lname}`,
    });
    // console.log('customer: ', customer);
    let referrerObj = {};
    // console.log(`req.body.referral`, req.body.referral);
    if (req.body.referral) {
      let referrer = await User.findOne({
        referralId: `${req.body.referral}`,
      });
      // console.log(`referrer._id`, referrer);
      if (referrer) {
        referrerObj = {
          referrer: referrer._id,
        };
      }
    }
    // console.log(`referrerObj`, referrerObj);
    const orgId = uuidv4();
    const user = new User({
      email: req.body.email,
      fname: req.body.fname,
      lname: req.body.lname,
      customerId: customer.id,
      issocial: req.body.issocial,
      password: bcrypt.hashSync(req.body.password, 8),
      referralId: uuidv4(),
      ...referrerObj,
      orgInfo: [
        {
          orgId: orgId,
          orgName: `${req.body.fname}'s Team`,
          userId: '',
        },
      ],
      invitation: [
        {
          userId: '',
          email: req.body.email,
          permId: 0,
          status: 1,
          orgId: orgId,
          orgName: `${req.body.fname}'s Team`,
        },
      ],
    });
    const newUser = await user.save();
    if (!newUser) {
      res.status(500).json({
        message: 'Failed to create new one user',
      });
      return;
    }

    const orgInfo = await User.findOneAndUpdate(
      { 'orgInfo.orgId': orgId, 'invitation.email': req.body.email },
      {
        $set: {
          'orgInfo.$.userId': user._id,
          'invitation.$.userId': newUser._id,
        },
      },
      { new: true }
    );

    // const invitationInfo = await User.findOneAndUpdate(
    //   { 'invitation.email': req.body.email },
    //   { $set: { 'invitation.$.userId': newUser._id } },
    //   { new: true }
    // );

    if (orgInfo) {
      // signin(req, res);
      return res.status(200).json({
        code: 200,
        message: 'Successfully you are registered!',
        data: newUser,
      });
    }
  } catch (err) {
    console.log('err: ', err);
    if (err) {
      res.status(500).json({
        message: err,
      });
      return;
    }
  }
};

const signin = async (req, res) => {
  // Check if req.body.email is a valid email address
  if (
    !req.body.email ||
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(req.body.email)
  ) {
    return res.status(400).json({
      message: 'Please enter a valid email address',
    });
  }

  // Check if req.body.password is at least 6 characters long
  if (!req.body.password || req.body.password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long',
    });
  }

  try {
    const user = await User.findOne({ email: req.body.email })
      // .populate('roles', '-__v')
      .exec();
    if (!user) {
      return res.status(404).json({ message: 'User Not found.' });
    }
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        token: null,
        message: 'Invalid Password!',
      });
    }

    const currentUser = await User.findOne({
      'orgInfo.userId': user._id,
    }).sort({ 'orgInfo.created': 1 });

    // console.log(user.currentOrgId);
    const userToken = {
      _id: user._id,
      email: user.email,
      customerId: user.customerId,
      accountType: user.accountType,
      // orgId: currentUser.orgInfo[0].orgId,
    };

    var token = jwt.sign(userToken, 'ebeb1a5ada5cf38bfc2b49ed5b3100e0', {
      expiresIn: 86400, // 24 hours
    });

    let profile = {
      ...user.toObject(),
    };
    delete profile.password;

    let currentOrgInfo = {
      _id: profile._id,
      currentOrgId: currentUser.orgInfo[0].orgId,
      currentOrgName: currentUser.orgInfo[0].orgName,
    };

    delete currentOrgInfo.orgInfo;
    // console.log('currentOrgInfo: ', currentOrgInfo);
    res.status(200).json({
      token,
      profile,
      currentOrgInfo,
    });
  } catch (err) {
    console.log(err);
    if (err) {
      res.status(500).json({ message: err });
      return;
    }
  }
};

// const checkuserexistance = async (req, res) => {
//   const req = req.params.param;
//   console.log(req);
// };

const invite = async (req, res) => {
  const param = req.params.param;
  // console.log('Hello, This is param: ', param);
  // const inviteInfo = authorizeInvitation(param);
  // console.log('param: ', param);
  const inviteInfo = jwt.verify(param, 'ebeb1a5ada5cf38bfc2b49ed5b3100e0');
  // console.log(inviteInfo);
  if (!inviteInfo) {
    return res
      .status(401)
      .json({ message: 'Invite Token Authentication Failed.' });
  }
  const { exp, validEmail } = inviteInfo;

  // console.log('inviteInfo: ', inviteInfo);
  if (Date.now() >= exp * 1000) {
    return res.status(401).json({ message: 'Invite Token is expired' });
  }

  // Check if request email is validated?
  // console.log('validEmail: ', validEmail);
  // console.log('email: ', req.body.email);
  if (validEmail.localeCompare(req.body.email) !== 0) {
    return res.status(400).json({
      message: 'This email is not validated in the invitation',
    });
  }

  // Check if req.body.email is a valid email address
  if (
    !req.body.email ||
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(req.body.email)
  ) {
    return res.status(400).json({
      message: 'Please enter a valid email address',
    });
  }
  // Check if req.body.password is at least 6 characters long
  if (!req.body.password || req.body.password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long',
    });
  }

  try {
    let user = await User.findOne({ email: req.body.email })
      // .populate('roles', '-__v')
      .exec();
    if (!user) {
      return res.status(404).json({ message: 'User Not found.' });
    }
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        token: null,
        message: 'Invalid Password!',
      });
    }

    let invitedUser = await User.findOne({
      _id: inviteInfo.orgUserId,
      'invitation.orgId': inviteInfo.orgId,
    });

    // res.status(200).json({
    //   code: 200,
    //   message: 'success',
    //   data: invitedUser,
    // });
    // const currentUser = await User.findOne({
    //   'orgInfo.userId': user._id,
    // }).sort({ 'orgInfo.created': 1 });

    if (!invitedUser) {
      return res.status(401).send({
        token: null,
        message: 'Invite link is not valid!',
      });
    }

    const isNameduplicated = await User.findOne({
      email: req.body.email,
      'orgInfo.orgId': inviteInfo.orgId,
    });

    // console.log('isNameduplicated: ', isNameduplicated);
    if (!isNameduplicated) {
      await User.updateOne(
        { _id: user._id },
        {
          $push: {
            orgInfo: {
              orgId: inviteInfo.orgId,
              orgName: inviteInfo.orgName,
              userId: inviteInfo.userId,
            },
          },
        }
      );
    }

    user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(500).json({ message: 'Internal Server Error!' });
    }

    // status : joined
    // const joined = await User.updateOne(
    //   { _id: inviteInfo.userId, 'invitation.email': req.body.email },
    //   {
    //     $set: {
    //       invitation: {
    //         status: 1,
    //       },
    //     },
    //   }
    // );
    const joined = await User.updateOne(
      {
        _id: inviteInfo.orgUserId,
        $or: [
          { 'invitation.email': req.body.email },
          { 'invitation.email': null },
        ],
      },
      {
        $set: {
          'invitation.$.status': 1,
        },
      }
    );

    if (!joined) {
      return res.status(500).json({ message: 'Internal Server Error!' });
    }
    // console.log('user: ', user);
    const userToken = {
      _id: user._id,
      email: user.email,
      customerId: user.customerId,
      accountType: user.accountType,
      // orgId: currentUser.orgInfo[0].orgId,
    };

    var token = jwt.sign(userToken, 'ebeb1a5ada5cf38bfc2b49ed5b3100e0', {
      expiresIn: 86400, // 24 hours
    });

    let profile = {
      ...user.toObject(),
    };
    delete profile.password;

    invitedUser = await User.findOne({
      _id: inviteInfo.orgUserId,
    });
    delete invitedUser.orgInfo;

    let currentOrgInfo = {
      // ...invitedUser.toObject(),
      _id: invitedUser._id,
      currentOrgId: inviteInfo.orgId,
      currentOrgName: inviteInfo.orgName,
    };
    res.status(200).json({
      token,
      profile,
      currentOrgInfo,
    });
  } catch (err) {
    console.log(err);
    if (err) {
      res.status(500).json({ message: err });
      return;
    }
  }
};

app.post('/signup', checkDuplicateUsernameOrEmail, signup);
app.post('/signin/', signin);
app.post('/signin/:param', invite);

module.exports = app;
