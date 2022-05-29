/* eslint-disable*/
import axios from 'axios';
const stripe = Stripe(
  'pk_test_51KwnQSDTe7Lufc1lml9XRncub4ZfjIeGNMVCZoMxa0cwoGLjsthG6wssDDqfXx7yoIRcEJQoI7NAGBCZE2guNbmb00HUgVSVS0'
);
export const bookTour = async tourId => {
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/check-session/${tourId}`
    );
    console.log(session);
    await stripe.redirectToCheckout({
      sessionId: session.data.sessions.id
    });
  } catch (err) {
    console.log(err);
  }
};
