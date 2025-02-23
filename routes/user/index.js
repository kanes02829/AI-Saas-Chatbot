const express = require('express');
const stripe = require('../middlewares/stripe');
const db = require('../models');
const User = db.user;
const Feedback = db.feedback;

// Prepare Core Router
let app = express.Router(); // User Subscribe

app.post('/stripe/subscribe', async (req, res) => {
  const domainURL = process.env.DOMAIN;
  console.log(domainURL);
  const { priceId, trial } = req.body;
  const STRIPE_PRODUCT_FREE = process.env.STRIPE_PRODUCT_FREE;
  const STRIPE_PRODUCT_ENTRY = process.env.STRIPE_PRODUCT_ENTRY;
  const STRIPE_PRODUCT_PRO = process.env.STRIPE_PRODUCT_PRO;
  console.log(domainURL);
  //console.log((await User.findOne({ _id: req.user._id })).customerId);

  try {
    let user = await User.findOne({ _id: req.user._id });
    console.log('user: ', user);
    let customer = user.customerId
      ? { customer: user.customerId }
      : { customer_email: user.email };

    console.log('customer: ', customer);
    console.log('priceId: ', priceId);
    console.log('trial: ', trial);
    console.log('free: ', STRIPE_PRODUCT_FREE);
    console.log('entry: ', STRIPE_PRODUCT_ENTRY);
    console.log('pro: ', STRIPE_PRODUCT_PRO);

    const subscription_data = trial ? { trial_period_days: 7 } : {};
    console.log('subscription: ', subscription_data);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data,
      success_url: `${domainURL}signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}signup/failed`,
      ...customer,
    });
    console.log(priceId);
    console.log(STRIPE_PRODUCT_FREE);
    console.log(STRIPE_PRODUCT_ENTRY);
    console.log(STRIPE_PRODUCT_PRO);
    if (priceId === STRIPE_PRODUCT_FREE) {
      user.plan = 'Entry';
      user.status = 'trialing';
      await user.save();
    } else if (priceId === STRIPE_PRODUCT_ENTRY) {
      user.plan = 'None';
      user.status = 'active';
      await user.save();
    } else if (priceId === STRIPE_PRODUCT_PRO) {
      user.plan = 'None';
      user.status = 'active';
      await user.save();
    }
    res.redirect(303, session.url);
  } catch (e) {
    res.status(400);
    console.log(e);
    return res.send({
      error: {
        message: e.message,
      },
    });
  }
});

app.post('/stripe/customer-portal', async (req, res) => {
  try {
    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const domainURL = process.env.DOMAIN;
    const returnUrl = `${domainURL}my-profile`;

    let user = await User.findOne({ _id: req.user._id });

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.customerId,
      return_url: returnUrl,
    });

    // Redirect to the URL for the session
    res.redirect(303, portalSession.url);
  } catch (err) {
    // console.log(err)
    await User.updateOne(
      { _id: req.user._id },
      {
        customerId: '',
        status: 'canceled',
        plan: '',
        trial_end: 0,
        current_period_end: 0,
      }
    );
    // console.log(err)
    const domainURL = process.env.DOMAIN;
    const returnUrl = `${domainURL}my-profile`;
    res.redirect(303, returnUrl);
  }
});

app.post('/stripe/activate', async (req, res) => {
  try {
    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const domainURL = process.env.DOMAIN;
    const returnUrl = `${domainURL}my-profile`;

    let user = await User.findOne({ _id: req.user._id });

    const subscriptions = await stripe.subscriptions.list({
      customer: user.customerId,
      limit: 1,
    });
    //   console.log(`subscriptions`,subscriptions.data[0].id)

    let update = stripe.subscriptions.update(subscriptions.data[0].id, {
      trial_end: 'now',
      cancel_at_period_end: false,
    });
    console.log(update);
    setTimeout(() => res.redirect(303, returnUrl), 2500);
    // Redirect to the URL for the session
  } catch (err) {
    console.log(err);
    const domainURL = process.env.DOMAIN;
    const returnUrl = `${domainURL}my-profile`;
    res.redirect(303, returnUrl);
  }
});

app.post('/stripe/cancel', async (req, res) => {
  try {
    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const domainURL = process.env.DOMAIN;
    const returnUrl = `${domainURL}my-profile`;

    let user = await User.findOne({ _id: req.user._id });

    const subscriptions = await stripe.subscriptions.list({
      customer: user.customerId,
      limit: 1,
    });
    //   console.log(`subscriptions`,subscriptions.data[0].id)

    let update = stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true,
    });
    setTimeout(() => res.redirect(303, returnUrl), 2500);
  } catch (err) {
    console.log(err);
    const domainURL = process.env.DOMAIN;
    const returnUrl = `${domainURL}my-profile`;
    res.redirect(303, returnUrl);
  }
});

app.post('/stripe/uncancel', async (req, res) => {
  try {
    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const domainURL = process.env.DOMAIN;
    const returnUrl = `${domainURL}my-profile`;

    let user = await User.findOne({ _id: req.user._id });

    const subscriptions = await stripe.subscriptions.list({
      customer: user.customerId,
      limit: 1,
    });
    //   console.log(`subscriptions`,subscriptions.data[0].id)

    let update = stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: false,
    });
    setTimeout(() => res.redirect(303, returnUrl), 2500);
  } catch (err) {
    console.log(err);
    const domainURL = process.env.DOMAIN;
    const returnUrl = `${domainURL}my-profile`;
    res.redirect(303, returnUrl);
  }
});

app.post('/stripe/plan', async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user._id });

    let obj = {
      plan: 'None',
      status: 'trailing',
      start_date: '',
      cancel_at_period_end: '',
      current_period_end: '',
    };

    if (user.customerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.customerId,
        limit: 1,
      });

      if (subscriptions.data[0]) {
        obj.plan = subscriptions.data[0].plan.nickname;
        console.log(subscriptions.data[0].plan);
        obj.status = subscriptions.data[0].status;
        obj.start_date = subscriptions.data[0].start_date;
        obj.cancel_at_period_end = subscriptions.data[0].cancel_at_period_end;
        obj.current_period_end = subscriptions.data[0].current_period_end;
      }
    }

    res.json(obj);
  } catch (err) {
    console.log(err);
  }
});

app.post('/refresh/profile', async (req, res) => {
  let user = await User.findOne({ _id: req.user._id });
  let profile = {
    ...user.toObject(),
  };

  delete profile.password;
  res.json({
    profile: profile,
  });
});

app.post('/feedback', async (req, res) => {
  try {
    const feedback = new Feedback({
      user: req.user._id,
      feedback: req.body.feedback,
      email: req.user.email,
    });
    await feedback.save();
    res.json({ success: true });
  } catch (err) {
    console.log(err);
  }
});

app.post('/feedback/view', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      user: req.user._id,
    })
      .sort({ _id: -1 })
      .limit(5);
    res.json(feedbacks);
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
