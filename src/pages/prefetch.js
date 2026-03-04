let checkoutPromise = null;
let orderSuccessPromise = null;

export const preloadCheckoutPage = () => {
  if (!checkoutPromise) {
    checkoutPromise = import('@/pages/Checkout');
  }
  return checkoutPromise;
};

export const preloadOrderSuccessPage = () => {
  if (!orderSuccessPromise) {
    orderSuccessPromise = import('@/pages/OrderSuccess');
  }
  return orderSuccessPromise;
};
