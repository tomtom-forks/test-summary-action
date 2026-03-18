import { expect, assert } from "chai"

import { TestStatus, parseJunitFile } from "../src/test_parser"
import { getResultsFromPaths } from "../src/index"
import { markFlakyTests } from "../src/flaky_tests"

const resourcePath = `${__dirname}/resources/junit`

describe("results", async () => {
    it("merges tests/testsuites executed several times", async () => {
        let paths = [
            `${resourcePath}/03-junit.xml`,
            `${resourcePath}/03-junit.xml`
        ]

        const total = await getResultsFromPaths(paths)
        expect(total.counts.passed).to.eql(10)
        expect(total.suites[0].cases[0].run_count).to.eql(2)
        expect(total.suites[0].cases[0].fail_count).to.eql(0)
        expect(total.suites[0].cases[4].run_count).to.eql(2)
        expect(total.suites[0].cases[4].fail_count).to.eql(2)
        expect(total.suites[0].cases[8].run_count).to.eql(0) // Skipped tests should have run_count=0
        expect(total.suites[0].cases[11].fail_count).to.eql(2)
        expect(total.suites[0].cases[11].run_count).to.eql(4)
        expect(total.suites.length).to.eql(1) // There's only one suite
    })

    it("marks tests as flaky when merged runs include both pass and fail", async () => {
        let paths = [
            `${resourcePath}/03-junit.xml`
        ]
        const total = await getResultsFromPaths(paths)
        markFlakyTests(total, "")
        expect(total.suites[0].cases[10].flaky).to.eql(false)
        expect(total.suites[0].cases[11].flaky).to.eql(true)
    })
})
