const express = require('express');
const jwt = require('jsonwebtoken');
const stripe = require('../middlewares/stripe');
const db = require('../models/index');
const { ObjectID } = require('mongodb');

const User = db.user;

// Prepare Core Router
let router = express.Router();

router.post('/inviteuser', async (req, res) => {
  const invitation = req.body;
  // console.log('invitation', req.body);
  try {
    const user = await User.findOne({ _id: invitation.orgUserId });
    // console.log('user.email: ', user.email);
    // console.log('invitation: ', invitation.email);

    // check if invitation in organizer has duplicated email

    if (user.email.localeCompare(invitation.email) === 0) {
      return res.status(200).json({
        code: 409,
        message: 'Unfortunately, you cannot invite yourself',
        data: [],
      });
    }
    // orgId & email in invitation
    const isInvited = await User.findOne({
      _id: invitation.orgUserId,
      'invitation.email': invitation.email,
      'invitation.orgId': invitation.orgId,
    });

    if (isInvited) {
      return res.status(200).json({
        code: 409,
        message: 'Unfortunately, This user is already invited',
        data: [],
      });
    }

    // invitation.organizationID
    const updatedUser = await User.updateOne(
      {
        _id: invitation.orgUserId,
      },
      { $push: { invitation: invitation } }
    );

    if (!updatedUser) {
      return res
        .status(200)
        .json({ code: 500, message: 'Internal Server Error!', data: [] });
    }

    // console.log('invitation: ', invitation);
    const invitationToken = {
      orgId: invitation.orgId,
      orgName: invitation.orgName,
      userId: invitation.userId,
      orgUserId: invitation.orgUserId,
      validEmail: invitation.email,
    };

    var token = jwt.sign(invitationToken, 'ebeb1a5ada5cf38bfc2b49ed5b3100e0', {
      expiresIn: 86400, // 24 hours
    });

    const inviteLink = invitation.url + token;
    console.log('inviteLink: ', inviteLink);

    // send invitation link

    return res.status(200).json({
      code: 200,
      data: inviteLink,
      message: 'Invited successfully!',
    });

    // res.status(200).json({
    //   message: 'Successfully!',
    // });
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      code: 500,
      message: 'Internal Server Error!',
      data: [],
    });
  }
});

router.post('/getCurrentInfo', async (req, res) => {
  try {
    const { _id, orgId } = req.body;

    const invitations = await User.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $toString: '$_id' }, _id],
          },
          'invitation.orgId': orgId,
        },
      },
      {
        $unwind: '$invitation',
      },
      {
        $project: {
          _id: '$invitation._id',
          orgId: '$invitation.orgId',
          orgName: '$invitation.orgName',
          userId: '$invitation.userId',
          email: '$invitation.email',
          permId: '$invitation.permId',
          status: '$invitation.status',
          created: '$invitation.created',
        },
      },
    ]);

    const userInfo = await User.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $toString: '$_id' }, _id],
          },
        },
      },
      {
        $project: {
          _id: '$_id',
          email: '$email',
          fname: '$fname',
          lname: '$lname',
          accountType: '$accountType',
          created: '$created',
        },
      },
    ]);

    // console.log('invitation: ', invitations);
    // console.log('userInfo: ', userInfo);

    if (!invitations) {
      return res.status(200).json({
        code: 500,
        message: 'Internal Server Error!',
        data: [],
      });
    }
    return res.status(200).json({
      code: 200,
      message: 'success',
      invitation: invitations,
      userInfo: userInfo,
    });
  } catch (err) {
    return res.status(200).json({
      code: 500,
      message: 'Internal Server Error!',
      data: [],
    });
  }
});

router.post('/changePermission', async (req, res) => {
  try {
    const { userId, invitationId, permId } = req.body;

    let user = await User.findOne({
      _id: userId,
      'invitation._id': invitationId,
    });
    if (!user) {
      return res.status(200).json({
        code: 400,
        message: 'This user does not exist!',
        data: [],
      });
    }
    user = await User.updateOne(
      { _id: userId, 'invitation._id': invitationId },
      {
        $set: {
          'invitation.$.permId': permId, // Using the positional operator "$" to specify the matched array element
        },
      }
    );
    console.log(user);
    if (user.modifiedCount === 1) {
      return res.status(200).json({
        code: 200,
        message: 'Edited successfully!',
        data: user.upsertedId,
      });
    } else {
      return res.status(200).json({
        code: 500,
        message: 'Internal Server Error!',
        data: [],
      });
    }
  } catch (err) {
    return res.status(200).json({
      code: 500,
      message: 'Internal Server Error!',
      data: [],
    });
  }
});

router.post('/deleteInvitedUser', async (req, res) => {
  try {
    const { userId, invitationId } = req.body;
    // console.log(req.body);
    const user = await User.aggregate([
      // the $unwind stage should come before the $match stage to ensure
      // that each document is split into multiple documents based on the invitation array before matching.
      {
        $unwind: '$invitation',
      },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $toString: '$_id' }, userId.toString()] },
              {
                $eq: [
                  { $toString: '$invitation._id' },
                  invitationId.toString(),
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          email: '$invitation.email',
          orgId: '$invitation.orgId',
          status: '$invitation.status',
        },
      },
    ]);
    if (user.length === 0) {
      return res.status(200).json({
        code: 400,
        message: 'User information does not correct!',
        data: [],
      });
    }
    let result = await User.updateOne(
      { _id: userId },
      { $pull: { invitation: { _id: invitationId } } }
    );

    if (result.modifiedCount > 0) {
      console.log('Invitation Row deleted successfully.');
    } else {
      console.log('No matching rows found in invitation.');
      return res.status(200).json({
        code: 500,
        message: 'Internal Server Error!',
        data: [],
      });
    }

    const email = user[0].email;
    const orgId = user[0].orgId;
    const status = user[0].status;
    console.log(email);

    if (status === 1) {
      result = await User.updateOne(
        { email: email },
        { $pull: { orgInfo: { orgId: orgId } } }
      );
      if (result.modifiedCount > 0) {
        console.log('OrgInfo Row deleted successfully.');
      } else {
        console.log('No matching rows found in OrgInfo.');
        return res.status(200).json({
          code: 500,
          message: 'Internal Server Error!',
          data: [],
        });
      }
    }

    return res.status(200).json({
      code: 200,
      message: 'Deleted successfully!',
      data: email,
    });
  } catch (err) {
    console.log(err);
    return res.status(200).json({
      code: 500,
      message: 'Internal Server Error!',
      data: [],
    });
  }
});

module.exports = router;
