type FilteredTest = {
  message: string;
  test: string;
};

type FilteredTests = {
  filtered: FilteredTest[];
};

const ignoreStrings = [`placeholder.spec.ts`];

module.exports = async function filter(tests: string[]): Promise<FilteredTests> {
  return Promise.resolve({
    filtered: tests
      .filter((test) => {
        return ignoreStrings.reduce((acc, curr) => {
          return acc && test.indexOf(curr) === -1;
        }, true);
      })
      .map((filterMatch) => {
        return { message: `skipping...`, test: filterMatch };
      }),
  });
};
