import fetch from 'cross-fetch';
import * as fs from 'fs';
import * as os from 'os';
import {
  AcrolinxEndpoint,
  CheckingCapabilities,
  CheckRequest,
  CheckResult,
  CheckType,
  ContentEncoding,
  Progress,
} from '@acrolinx/sdk';
import { IntegrationType, OperatingSystemFamily } from '@acrolinx/sdk/dist/src/telemetry/interfaces/integration';
export class AcrolinxSDKDemo {

  private acrolinxUrl: string;
  private clientSignature: string;

  constructor(acrolinxUrl: string, clientSignature: string) {
    this.acrolinxUrl = acrolinxUrl;
    this.clientSignature = clientSignature;
  }
  
  // Create Acrolinx Endpoint instance
  public createEndpoint(): AcrolinxEndpoint {
    return new AcrolinxEndpoint({
      client: {
        version: '1.0.0',
        signature: this.clientSignature,
        integrationDetails: {
          name: 'Acrolinx SDK Demo',
          version: '1.0.0',
          type: IntegrationType.automated,
          systemInfo: {
            operatingSystemInfo: {
              family:
                os.platform() === 'darwin'
                  ? OperatingSystemFamily.mac
                  : os.platform() === 'win32'
                    ? OperatingSystemFamily.windows
                    : os.platform() === 'linux'
                      ? OperatingSystemFamily.linux
                      : OperatingSystemFamily.other,
              name: os.type(),
              version: os.release(),
            },
          },
        },
      },
      acrolinxUrl: this.acrolinxUrl,
      fetch: fetch,
    });
  }

  // Create a Check Request.
  public createCheckRequest(batchId: string | null): CheckRequest {
    return {
      content: 'This sentence containss intentional spellingg mistakess.',
      checkOptions: {
        // Define your own mechanism to generate batchId and assignment.
        // One batch of check should have one batchId
        batchId: batchId,
        contentFormat: 'TEXT',
        languageId: 'en',
        //   interactive =  human user checks own document
        //   batch       =  human user checks many own documents
        //   baseline    =  a repository of documents is checked, the user doesn't own the documents
        //   automated   =  check of a single document for automated scenarios as for example a git hook
        checkType: CheckType.batch,
      },
      document: {
        // Furnish correct reference path for the file.
        reference: 'C:\\docs\\file.txt',
      },
    };
  }

    // Create a Check Request.
    public createWordCheckRequest(batchId: string | null): CheckRequest {
      return {
        content: this.getFileContent("./__tests__/testDoc/file.docx"),
        checkOptions: {
          batchId: batchId,
          contentFormat: 'AUTO',
          languageId: 'en',
          checkType: CheckType.batch,
        },
        document: {
          // Furnish correct reference path for the file.
          reference: 'C:\\docs\\file.docx',
        },
        contentEncoding: ContentEncoding.base64
      };
    }

  // Get Content Analysis Dashboard Link
  public async fetchContentAnalysisDashboardUrl(endpoint: AcrolinxEndpoint, accessToken: string, batchId: string): Promise<string> {
    return await endpoint.getContentAnalysisDashboard(accessToken, batchId);
  }

  // Get Acrolinx Platform Checking Capabilities
  public async getPlatformCapabilities(endpoint: AcrolinxEndpoint, accessToken: string): Promise<CheckingCapabilities> {
    return await endpoint.getCheckingCapabilities(accessToken);
  }

  // Run a check with Acrolinx
  public async checkWithAcrolinx(
    endpoint: AcrolinxEndpoint,
    checkRequest: CheckRequest,
    accessToken: string,
  ): Promise<CheckResult> {
    const checkResponse = endpoint.checkAndGetResult(
      accessToken,
      checkRequest,
      {
        onProgress: (progress: Progress) => {
          console.log(progress);
        },
      },
    );

    console.log('Check in progress: ' + checkResponse.getId());
    const checkResult = await checkResponse.promise;

    console.log('Check Completed');
    return checkResult;
  }

  private getFileContent(resolvedPath: string, format?: string): string {
    try {
      const buffer = fs.readFileSync(resolvedPath);
      if (format) {
        return buffer.toString(format as BufferEncoding);
      } else {
        return buffer.toString('base64');
      }
    } catch (e) {
      throw new Error('Couldn\u2019t parse the given input item. '
        + e.message);
    }
  }
}
