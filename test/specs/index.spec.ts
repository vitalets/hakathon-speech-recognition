describe('invoke', () => {

  it('start recognition', async () => {
    const body = await callHandler('POST', { action: 'recognize', file: 'test.mp3' });
    assert.deepEqual(body.operationId, 'fake-operaion-id');
  });

  it('check operation', async () => {
    const body = await callHandler('GET', { action: 'check', operationId: '123' });
    assert.deepEqual(body.done, true);
  });

});
