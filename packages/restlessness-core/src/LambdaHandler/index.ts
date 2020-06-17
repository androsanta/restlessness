import EnvironmentHandler from '../EnvironmentHandler';
import { ValidationObjects, ValidationResult, RequestI } from './interfaces';
import { JsonEndpoints, DaoPackage, JsonDaos, JsonDaosEntry } from '@restlessness/utilities';
import AWSLambda from 'aws-lambda';

export * from './interfaces';

export const LambdaHandler = async <T, Q, P, PP>(
  handler: (req: RequestI<Q, P, PP>) => any,
  validations: ValidationObjects,
  apiName: string,
  event: AWSLambda.APIGatewayProxyEventBase<T>,
  context: AWSLambda.Context,
) => {
  EnvironmentHandler.load();

  let queryStringParameters: any = event.queryStringParameters || {};
  let payload = JSON.parse(event.body || '{}');
  let pathParameters: any = event.pathParameters || {};
  const validationResult: ValidationResult = {
    isValid: true,
  };

  if (validations.queryStringParameters) {
    try {
      queryStringParameters = await validations.queryStringParameters.validate(queryStringParameters);
    } catch (e) {
      validationResult.isValid = false;
      validationResult.queryStringParametersErrors = e;
      queryStringParameters = validationResult.queryStringParametersErrors.value;
      validationResult.message = e.message;
    }
  }
  if (validations.payload) {
    try {
      payload = await validations.payload.validate(payload);
    } catch (e) {
      validationResult.isValid = false;
      validationResult.payloadErrors = e;
      payload = validationResult.payloadErrors.value;
      validationResult.message = e.message;
    }
  }
  if (validations.pathParameters) {
    try {
      pathParameters = await validations.pathParameters.validate(pathParameters);
    } catch (e) {
      validationResult.isValid = false;
      validationResult.pathParametersErrors = e;
      pathParameters = validationResult.pathParametersErrors.value;
      validationResult.message = e.message;
    }
  }

  // @TODO: Check Plugins beforeLambdas hooks
  const jsonEndpointsEntry = await JsonEndpoints.getEntryById(apiName);
  if (jsonEndpointsEntry) {
    if (jsonEndpointsEntry.daoIds?.length) {
      for (const daoId of jsonEndpointsEntry.daoIds)  {
        const jsonDaoEntry: JsonDaosEntry = await JsonDaos.getEntryById(daoId);
        try {
          const daoPackage: DaoPackage = DaoPackage.load(jsonDaoEntry.package);
          await daoPackage.beforeLambda(event, context);
        } catch (e) {
          console.error(`Error when calling beforeLambda hook on dao: ${jsonDaoEntry.name} (${jsonDaoEntry.id})`, e);
        }
      }
    }
  } else {
    console.error(`Cannot find Endpoint identified by ${apiName}`);
  }

  return await handler({
    validationResult,
    queryStringParameters,
    payload,
    pathParameters,
  });
};
