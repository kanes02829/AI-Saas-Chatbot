const express = require('express');
const stripe = require('../middlewares/stripe');
const db = require('../models/index');
const User = db.user;

// Prepare Core Router
let router = express.Router();

router.post('/getall', async (req, res) => {
  try {
  } catch (e) {}
});

router.post('/getCurrentOrgInfo', async (req, res) => {
  const { _id, orgId } = req.body;
  try {
    const user = await User.findOne(
      { _id: _id, 'orgInfo.orgId': orgId },
      { 'orgInfo.$': 1 }
    );
    if (!user) {
      return res
        .status(200)
        .json({ code: 500, message: 'Internal Server Error!', data: [] });
    }
    return res.status(200).json({
      code: 200,
      message: 'Successfully action is performed!',
      data: [{ orgName: user.orgInfo[0].orgName }],
    });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ code: 500, message: 'Internal Server Error!', data: [] });
  }
});

router.post('/updatename', async (req, res) => {
  try {
    const { _id, orgId, orgName } = req.body;
    const org = await User.findOneAndUpdate(
      { _id: _id, 'orgInfo.orgId': orgId },
      {
        $set: {
          'orgInfo.$.orgName': orgName,
        },
      },
      { new: true }
    );

    const invitation = await User.updateMany(
      { _id: _id, 'invitation.orgId': orgId },
      {
        $set: {
          'invitation.$.orgName': orgName,
        },
      },
      { new: true }
    );
    console.log('invita: ', invitation);
    if (invitation) {
      console.log('xxxxxxxx');
    }
    if (!(org && invitation)) {
      return res.status(200).json({
        code: 500,
        message: 'Internal Server Error!',
        data: [],
      });
    }

    return res.status(200).json({
      code: 200,
      message: 'Successfully action is performed!',
      data: [{ _id: org._id }],
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ code: 500, message: 'Internal Server Error!', data: [] });
  }
});

router.post('/createnewone', async (req, res) => {
  try {
  } catch (e) {}
});

module.exports = router;
