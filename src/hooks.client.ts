import posthog from 'posthog-js';

export const handleError = ({ error, status }) => {
  if (status !== 404) {
    posthog.captureException(error);
  }
};
