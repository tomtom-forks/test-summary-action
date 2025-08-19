import { expect, assert } from "chai"

import { TestStatus, parseJunitFile } from "../src/test_parser"
import { getResultsFromPaths } from "../src/index"

const resourcePath = `${__dirname}/resources/junit`

describe("results", async () => {
    it("merges tests/testsuites executed several times", async () => {
        let paths = [
            `${resourcePath}/03-junit.xml`,
            `${resourcePath}/03-junit.xml`
        ]

        const total = await getResultsFromPaths(paths)
        expect(total.counts.passed).to.eql(8)
        expect(total.suites[0].cases[0].run_count).to.eql(2)
        expect(total.suites[0].cases[0].fail_count).to.eql(0)
        expect(total.suites[0].cases[4].run_count).to.eql(2)
        expect(total.suites[0].cases[4].fail_count).to.eql(2)
        expect(total.suites[0].cases[8].run_count).to.eql(0) // Skipped tests should have run_count=0
        expect(total.suites.length).to.eql(1) // There's only one suite
    })
})
