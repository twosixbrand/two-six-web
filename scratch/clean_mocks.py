import os
import re

def clean_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove next/image mock blocks
    # Pattern matches jest.mock('next/image', ... ) including multiline
    content = re.sub(r"jest\.mock\('next\/image',.*?\}\)\);", "", content, flags=re.DOTALL)
    
    # Remove next/link mock blocks
    content = re.sub(r"jest\.mock\('next\/link',.*?\}\)\);", "", content, flags=re.DOTALL)
    
    # Clean up multiple newlines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

test_files = [
    "__tests__/app/checkout-success.page.test.tsx",
    "__tests__/app/checkout/success.page.test.tsx",
    "__tests__/app/page.test.tsx",
    "__tests__/app/tracking.page.test.tsx",
    "__tests__/components/Banner.test.tsx",
    "__tests__/components/CartItem.test.tsx",
    "__tests__/components/Catalog.test.tsx",
    "__tests__/components/CheckoutSummaryItem.test.tsx",
    "__tests__/components/Footer.test.tsx",
    "__tests__/components/Header.test.tsx",
    "__tests__/components/HeroCarousel.test.tsx",
    "__tests__/components/ProductCard.test.tsx",
    "__tests__/components/ProductDetail.test.tsx",
    "__tests__/components/SectionBanner.test.tsx",
    "__tests__/components/WhatsAppButton.test.tsx",
    "src/app/drop/page.test.tsx"
]

for f in test_files:
    if os.path.exists(f):
        print(f"Cleaning {f}")
        clean_file(f)
