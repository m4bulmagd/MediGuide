import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Define the Lambda Function that will process images
    const scanFunction = new lambda.Function(this, 'ScanPrescriptionFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')), // Code is in the 'lambda' folder
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    // 2. Grant the Lambda function permission to call Amazon Bedrock
    scanFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0'],

    }));

    
    // 3. Define the API Gateway endpoint
    const api = new apigw.RestApi(this, 'MedGuideApi', {
      // This block is essential for handling preflight requests
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS, // Allows requests from any origin
        allowMethods: apigw.Cors.ALL_METHODS, // Allows POST, GET, etc.
        allowHeaders: ['Content-Type'], // Specify allowed headers
      }
    });

    // 4. Create the '/scan-prescription' resource and integrate it with the Lambda
    const scanResource = api.root.addResource('scan-prescription');
    scanResource.addMethod('POST', new apigw.LambdaIntegration(scanFunction), {
        apiKeyRequired: false,
      });
    // 5. Output the API endpoint URL after deployment
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });
  }
}