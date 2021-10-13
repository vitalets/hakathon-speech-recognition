describe('invoke', () => {

  it('start recognition', async () => {
    const body = await callHandler('POST', '/');
    assert.deepEqual(body, { hello: 42 });
  });

});
