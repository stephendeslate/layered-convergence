import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

expect.extend(toHaveNoViolations);

describe('Card', () => {
  it('should render Card with children', () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should apply border class', () => {
    const { container } = render(<Card>Test</Card>);
    expect(container.firstChild).toHaveClass('border');
  });

  it('should apply custom className', () => {
    const { container } = render(<Card className="my-card">Test</Card>);
    expect(container.firstChild).toHaveClass('my-card');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>Test</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardHeader', () => {
  it('should render with children', () => {
    render(<CardHeader><span>Header</span></CardHeader>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('should apply padding class', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    expect(container.firstChild).toHaveClass('p-6');
  });
});

describe('CardTitle', () => {
  it('should render as h3', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Title');
  });

  it('should apply font-semibold class', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByRole('heading')).toHaveClass('font-semibold');
  });
});

describe('CardDescription', () => {
  it('should render with text', () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('should apply muted foreground class', () => {
    const { container } = render(<CardDescription>Desc</CardDescription>);
    expect(container.firstChild).toHaveClass('text-muted-foreground');
  });
});

describe('CardContent', () => {
  it('should render with children', () => {
    render(<CardContent><p>Content</p></CardContent>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('should render with children', () => {
    render(<CardFooter><button>Action</button></CardFooter>);
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('should apply flex class', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    expect(container.firstChild).toHaveClass('flex');
  });
});

describe('Card composition accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>A test card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Some content here</p>
        </CardContent>
        <CardFooter>
          <button>Submit</button>
        </CardFooter>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
