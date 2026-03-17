// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';


jest.mock('axios', () => {
	const mockClient = {
		interceptors: { request: { use: jest.fn() } },
		get: jest.fn(),
		post: jest.fn(),
	};

	return {
		__esModule: true,
		default: {
			create: jest.fn(() => mockClient),
		},
	};
});
