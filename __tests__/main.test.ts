import { ContentFormat } from "@acrolinx/sdk";
import { AcrolinxSDKDemo } from "../src/main";
import { uuid } from "uuidv4";
import * as dotenv from "dotenv";

dotenv.config();

describe("SDKDemo tests", () => {
  const TEST_SERVER_URL = process.env.TEST_SERVER_URL;
  const ACROLINX_API_TOKEN = process.env.ACROLINX_API_TOKEN;
  const ACROLINX_DEV_SIGNATURE = process.env.ACROLINX_DEV_SIGNATURE;

  it("test endpoint creation", () => {
    const demo = new AcrolinxSDKDemo(TEST_SERVER_URL, ACROLINX_DEV_SIGNATURE);
    const endpoint = demo.createEndpoint();
    expect(endpoint).not.toBeNull();
  });

  it("test check request creation", () => {
    const demo = new AcrolinxSDKDemo(TEST_SERVER_URL, ACROLINX_DEV_SIGNATURE);
    const checkRequest = demo.createCheckRequest("gen.demo." + uuid());

    expect(checkRequest).not.toBeNull();
    expect(checkRequest.content).not.toBeNull();
    expect(checkRequest.checkOptions).not.toBeNull();
    expect(checkRequest.checkOptions.checkType).not.toBeNull();
    expect(checkRequest.checkOptions.contentFormat).not.toBeNull();
  });

  it("test running check", async () => {
    const demo = new AcrolinxSDKDemo(TEST_SERVER_URL, ACROLINX_DEV_SIGNATURE);
    const endpoint = demo.createEndpoint();
    const checkRequest = demo.createCheckRequest("gen.demo." + uuid());

    const checkResult = await demo.checkWithAcrolinx(endpoint, checkRequest, ACROLINX_API_TOKEN);
    expect(checkResult).not.toBeNull();
    expect(checkResult.quality.score).not.toBeNull();

    console.log("Acrolinx Score: " + checkResult.quality.score);
    console.log("Scorecard Url: " + checkResult.reports.scorecard.link);

    const contentAnalysisDashboardLink = await demo.fetchContentAnalysisDashboardUrl(
      endpoint,
      ACROLINX_API_TOKEN,
      checkRequest.checkOptions.batchId,
    );

    expect(contentAnalysisDashboardLink).not.toBeNull();
    console.log("Content Analysis Dashboard Link: " + contentAnalysisDashboardLink);
  }, 10_000);

  it("test running check for word document", async () => {
    const demo = new AcrolinxSDKDemo(TEST_SERVER_URL, ACROLINX_DEV_SIGNATURE);
    const endpoint = demo.createEndpoint();
    const checkRequest = demo.createWordCheckRequest("gen.demo." + uuid());

    const checkResult = await demo.checkWithAcrolinx(endpoint, checkRequest, ACROLINX_API_TOKEN);
    expect(checkResult).not.toBeNull();
    expect(checkResult.quality.score).not.toBeNull();

    console.log("Acrolinx Score: " + checkResult.quality.score);
    console.log("Scorecard Url: " + checkResult.reports.scorecard.link);

    const contentAnalysisDashboardLink = await demo.fetchContentAnalysisDashboardUrl(
      endpoint,
      ACROLINX_API_TOKEN,
      checkRequest.checkOptions.batchId,
    );

    expect(contentAnalysisDashboardLink).not.toBeNull();
    console.log("Content Analysis Dashboard Link: " + contentAnalysisDashboardLink);
  });

  it("test fetching platform capabilities", async () => {
    const demo = new AcrolinxSDKDemo(TEST_SERVER_URL, ACROLINX_DEV_SIGNATURE);
    const endpoint = demo.createEndpoint();

    const capabilities = await demo.getPlatformCapabilities(endpoint, ACROLINX_API_TOKEN);
    expect(capabilities).not.toBeNull();
    expect(capabilities.contentFormats).not.toBeNull();

    capabilities.contentFormats.forEach((format: ContentFormat) => {
      console.log("Format: " + format.displayName + " id: " + format.id);
    });
  });
});
