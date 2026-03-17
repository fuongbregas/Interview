import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import SearchComponent from './SearchComponent';

describe('SearchComponent', () => {
  test('renders input with placeholder and controlled value', () => {
    render(<SearchComponent value="task" onChange={jest.fn()} />);

    const input = screen.getByPlaceholderText(/search by todo name or description/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('task');
  });

  test('calls onChange with typed value', () => {
    const onChange = jest.fn();
    render(<SearchComponent value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText(/search by todo name or description/i);
    fireEvent.change(input, { target: { value: 'milk' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('milk');
  });

  test('works with empty string value', () => {
    render(<SearchComponent value="" onChange={jest.fn()} />);

    const input = screen.getByPlaceholderText(/search by todo name or description/i);
    expect(input).toHaveValue('');
  });
});
