module.exports = async (promise) => {
  try {
    await promise;
    assert.fail('Expected assert failure not received');
  } catch (error) {
    const assertFailFound = error.message.search('assert.fail') >= 0;
    assert(assertFailFound, `Expected "assert failure", got ${error} instead`);
  }
};
