import * as fs from "fs"
import * as core from "@actions/core"

import { TestSuite, TestResult } from "./test_parser"

// This is the maximum length for a VARCHAR in PostgreSQL, which is used to store test case names for flaky tests.
const MAX_LONG_VARCHAR_LENGTH = 65535;

export function markFlakyTests(result: TestResult, flakyTestsJsonPath: any): TestResult {
  if (!fs.existsSync(flakyTestsJsonPath)) {
    core.warning(`Flaky tests JSON file not found: ${flakyTestsJsonPath}`);
    return result; // Return the original result if no flaky tests file is found
  }
  const data = fs.readFileSync(flakyTestsJsonPath, "utf-8");
  const flakyTestsJson = JSON.parse(data);

    for (const flakyTest of flakyTestsJson) {
        const suiteName = flakyTest.testsuite;

        const matchingSuite = result.suites.find((suite) => suite.project === suiteName || suite.name === suiteName);
        if (matchingSuite) {
            const matchingCase = matchingSuite.cases.find((testCase) =>
                (testCase.name?.slice(0, MAX_LONG_VARCHAR_LENGTH) === flakyTest.name) && testCase.description === flakyTest.class);

            if (matchingCase) {
                matchingCase.flaky = true; // Mark the case as flaky
                matchingCase.flakyTestTicket = flakyTest.jira_ticket_url; // Set the ticket if available
            }
        }
    }

    // Sort the test cases within each suite: flaky=false cases first
    result.suites.forEach((suite) => {
        suite.cases.sort((a, b) => {
            const flakyA = a.flaky;
            const flakyB = b.flaky;
            return Number(flakyA) - Number(flakyB);
        });
    });
    return result;
  }
