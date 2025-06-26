import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NavigationBar } from '../src/components/NavigationBar';

describe('NavigationBar Component', () => {
  it('renders NavigationBar with correct props', () => {
    render(
      <NavigationBar 
        activeSection="home" 
        onSectionChange={() => {}} 
        isPremium={false} 
      />
    );

    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();
  });
  it('displays correct active section', () => {
    render(
      <NavigationBar 
        activeSection="home" 
        onSectionChange={() => {}} 
        isPremium={false} 
      />
    );

    const activeSection = screen.getByText(/home/i);
    expect(activeSection).toHaveClass('text-amber-400');
  });
});
