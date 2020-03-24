require('module-alias/register');
import handler from './handler';
import { requestParser } from '@restlessness/core';

export default async (event, context) => {
  // @TODO: Add payload validator
  const {
    queryStringParameters,
    payload,
  } = requestParser(event);
  return await handler({
    queryStringParameters,
    payload,
  });
};
