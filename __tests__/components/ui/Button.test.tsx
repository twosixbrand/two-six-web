import * as React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { Button } from "@/components/ui/button"

describe("Button component", () => {
    it("renders a button by default", () => {
        render(<Button>Click me</Button>)
        expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument()
    })

    it("applies default variant and size classes", () => {
        render(<Button>Default</Button>)
        const button = screen.getByRole("button", { name: "Default" })
        expect(button).toHaveClass("bg-primary text-primary-foreground") // default variant
        expect(button).toHaveClass("h-9 px-4 py-2") // default size
    })

    it("applies specific variant classes", () => {
        render(<Button variant="destructive">Destructive</Button>)
        expect(screen.getByRole("button", { name: "Destructive" })).toHaveClass("bg-destructive")
    })

    it("applies specific size classes", () => {
        render(<Button size="lg">Large</Button>)
        expect(screen.getByRole("button", { name: "Large" })).toHaveClass("h-10 px-8")
    })

    it("merges custom classes correctly", () => {
        render(<Button className="custom-class">Custom</Button>)
        const button = screen.getByRole("button", { name: "Custom" })
        expect(button).toHaveClass("bg-primary") // retains original
        expect(button).toHaveClass("custom-class") // adds new
    })

    it("handles clicks", () => {
        const handleClick = jest.fn()
        render(<Button onClick={handleClick}>Clickable</Button>)

        fireEvent.click(screen.getByRole("button", { name: "Clickable" }))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("passes disabled prop correctly", () => {
        render(<Button disabled>Disabled</Button>)
        expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled()
    })

    it("renders as a different child component using asChild", () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        )

        const link = screen.getByRole("link", { name: "Link Button" })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute("href", "/test")
        expect(link).toHaveClass("bg-primary") // verifies classes are passed to child
    })
})
