import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

describe("Tabs component", () => {
    it("renders tabs and switches content when clicked", async () => {
        const user = userEvent.setup()

        render(
            <Tabs defaultValue="tab1">
                <TabsList>
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">Content 1</TabsContent>
                <TabsContent value="tab2">Content 2</TabsContent>
            </Tabs>
        )

        // Initial state
        expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveAttribute("data-state", "active")
        expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveAttribute("data-state", "inactive")

        // Content 1 should be visible, Content 2 should not
        expect(screen.getByText("Content 1")).toBeInTheDocument()
        expect(screen.queryByText("Content 2")).not.toBeInTheDocument()

        // Click Tab 2
        await user.click(screen.getByRole("tab", { name: "Tab 2" }))

        // New state
        expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveAttribute("data-state", "inactive")
        expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveAttribute("data-state", "active")

        // Content 2 should be visible, Content 1 should not
        expect(screen.queryByText("Content 1")).not.toBeInTheDocument()
        expect(screen.getByText("Content 2")).toBeInTheDocument()
    })

    it("applies custom classes to tab components", () => {
        render(
            <Tabs defaultValue="tab1" className="custom-root">
                <TabsList className="custom-list">
                    <TabsTrigger value="tab1" className="custom-trigger">Tab 1</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="custom-content">Content 1</TabsContent>
            </Tabs>
        )

        // Get elements (Note: Radix wraps things internally, we test what gets rendered)
        const tabList = screen.getByRole("tablist")
        expect(tabList).toHaveClass("custom-list")

        const tabTrigger = screen.getByRole("tab", { name: "Tab 1" })
        expect(tabTrigger).toHaveClass("custom-trigger")

        const tabContent = screen.getByRole("tabpanel")
        expect(tabContent).toHaveClass("custom-content")
    })
})
