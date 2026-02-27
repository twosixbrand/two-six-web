import * as React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { Input } from "@/components/ui/input"

describe("Input component", () => {
    it("renders an input element", () => {
        render(<Input placeholder="Test input" />)
        expect(screen.getByPlaceholderText("Test input")).toBeInTheDocument()
    })

    it("passes additional props to the input element", () => {
        render(<Input data-testid="test-input" disabled />)
        const input = screen.getByTestId("test-input")
        expect(input).toBeDisabled()
    })

    it("applies custom classes", () => {
        render(<Input data-testid="test-input" className="custom-test-class" />)
        const input = screen.getByTestId("test-input")
        expect(input).toHaveClass("custom-test-class")
    })

    it("handles user input", () => {
        const handleChange = jest.fn()
        render(<Input data-testid="test-input" onChange={handleChange} />)

        const input = screen.getByTestId("test-input")
        fireEvent.change(input, { target: { value: 'new value' } })

        expect(handleChange).toHaveBeenCalledTimes(1)
        expect((input as HTMLInputElement).value).toBe('new value')
    })

    it("renders different types correctly", () => {
        const { rerender } = render(<Input data-testid="test-input" type="password" />)
        expect(screen.getByTestId("test-input")).toHaveAttribute("type", "password")

        rerender(<Input data-testid="test-input" type="email" />)
        expect(screen.getByTestId("test-input")).toHaveAttribute("type", "email")
    })
})
