describe('invoke', () => {

  it('start recognition', async () => {
    const body = await callHandler('POST', { action: 'recognize', file: 'test.mp3' });
    assert.match(body.operationId, /fake-id-\d+/);
  });

  it('check operation (progress)', async () => {
    const body = await callHandler('GET', { action: 'check', operationId: `fake-id-${Date.now()}` });
    assert.deepEqual(body.done, false);
  });

  it('check operation (done)', async () => {
    const body = await callHandler('GET', { action: 'check', operationId: '123' });
    assert.deepEqual(body.done, true);
  });

});
