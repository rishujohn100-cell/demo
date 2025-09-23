import { Navigation } from "@/components/navigation";
import { CartSidebar } from "@/components/cart-sidebar";
import { Footer } from "@/components/footer";
import { DesignCanvas } from "@/components/design-canvas";

export default function DesignStudioPage() {
  return (
    <div className="min-h-screen bg-background">
      <CartSidebar>
        <Navigation />
      </CartSidebar>

      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Design Studio</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create your unique T-shirt design with our powerful design tools. Add text, shapes, images, and customize everything to your liking.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden min-h-[600px]">
            <DesignCanvas />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
