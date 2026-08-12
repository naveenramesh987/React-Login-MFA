import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

/**
 * Toolchain smoke test: proves Vitest + jsdom + React Testing Library +
 * jest-dom matchers are wired up. Safe to delete once real suites exist.
 */
describe('test toolchain', () => {
  it('renders a component and applies jest-dom matchers', () => {
    render(<h1>Login + MFA</h1>)
    expect(screen.getByRole('heading', { name: 'Login + MFA' })).toBeInTheDocument()
  })
})
