import publicRuntimeConfigUtils from './_public-runtime-config.cjs';

const {
  buildMissingPublicRuntimeConfigMessage,
  createPublicRuntimeConfig,
  getMissingPublicRuntimeConfigFields,
} = publicRuntimeConfigUtils;

export const handler = async () => {
  const payload = createPublicRuntimeConfig(process.env);
  const missingFields = getMissingPublicRuntimeConfigFields(payload);

  if (missingFields.length > 0) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({
        error: buildMissingPublicRuntimeConfigMessage(missingFields),
        missingFields,
      }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(payload),
  };
};
