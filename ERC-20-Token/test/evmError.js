module.exports = async (promise) => {
  try {
    await promise;
    assert.fail('Expected VM  error not received');
  } catch (error) {
    const evmErrorFound = error.message.search('VM Exception') >= 0;
    assert(evmErrorFound, `Expected "VM Exception", got ${error} instead`);
  }
};