describe.skip('satay()', () => {
  const doneListener = jest.fn();
  const errorListener = jest.fn();

  beforeEach(() => {
    doneListener.mockClear();
    errorListener.mockClear();
  });

  it('should emit done when ...', () => {
    expect(doneListener).toBeCalledTimes(1);
    expect(errorListener).toBeCalledTimes(0);
  });
  it('should emit error when ...', () => {
    expect(doneListener).toBeCalledTimes(0);
    expect(errorListener).toBeCalledTimes(1);
  });
});
