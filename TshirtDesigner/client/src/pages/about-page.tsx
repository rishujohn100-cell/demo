import { Navigation } from "@/components/navigation";
import { CartSidebar } from "@/components/cart-sidebar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Palette, 
  Lightbulb, 
  Users, 
  Recycle, 
  Award, 
  Globe,
  Heart,
  Shirt,
  Target,
  CheckCircle
} from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: <Palette className="h-8 w-8 text-blue-600" />,
      title: "Creative Freedom",
      description: "We believe everyone deserves to express their unique style and creativity through custom design."
    },
    {
      icon: <Award className="h-8 w-8 text-green-600" />,
      title: "Premium Quality",
      description: "Using only the finest materials and printing techniques to ensure your designs look amazing and last long."
    },
    {
      icon: <Recycle className="h-8 w-8 text-emerald-600" />,
      title: "Sustainability",
      description: "Committed to eco-friendly practices, sustainable materials, and reducing our environmental footprint."
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Community",
      description: "Building a vibrant community of creators, designers, and fashion enthusiasts who inspire each other."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "The Beginning",
      description: "Founded with a vision to democratize custom fashion design and make it accessible to everyone."
    },
    {
      year: "2021",
      title: "First 1000 Customers",
      description: "Reached our first milestone of serving 1000 happy customers with custom designs."
    },
    {
      year: "2022",
      title: "Sustainable Initiative",
      description: "Launched our eco-friendly product line using 100% organic cotton and water-based inks."
    },
    {
      year: "2023",
      title: "Design Studio Launch",
      description: "Introduced our advanced online design studio with professional-grade editing tools."
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Expanded shipping to 50+ countries, bringing custom fashion to creators worldwide."
    }
  ];

  const teamStats = [
    { number: "50,000+", label: "Happy Customers", icon: <Users className="h-6 w-6" /> },
    { number: "100,000+", label: "Designs Created", icon: <Palette className="h-6 w-6" /> },
    { number: "25+", label: "Countries Served", icon: <Globe className="h-6 w-6" /> },
    { number: "98%", label: "Customer Satisfaction", icon: <Heart className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      <CartSidebar>
        <Navigation />
      </CartSidebar>

      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              About TeeDesign Studio
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Empowering Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Creative Vision
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              We're more than just a custom t-shirt company. We're your creative partner, 
              helping you bring your unique ideas to life with premium quality and 
              sustainable practices.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4">
                  Our Story
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Born from a Simple Idea
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    TeeDesign Studio was born from a simple yet powerful idea: everyone should be able to 
                    create and wear designs that truly represent who they are. Our founders, a group of 
                    artists and tech enthusiasts, were frustrated by the limitations of existing custom 
                    apparel platforms.
                  </p>
                  <p>
                    We noticed that most platforms either offered poor design tools or compromised on 
                    quality. So we set out to build something different – a platform that combines 
                    professional-grade design capabilities with premium materials and ethical manufacturing.
                  </p>
                  <p>
                    Today, we're proud to serve creators, businesses, and individuals from around the world, 
                    helping them express their creativity while maintaining our commitment to sustainability 
                    and quality.
                  </p>
                </div>
              </div>
              <div className="lg:pl-8">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Target className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Our Mission</h3>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      To democratize custom fashion design by providing accessible, high-quality tools 
                      and sustainable manufacturing that empowers everyone to create and wear their 
                      unique style.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Make design accessible to everyone</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Maintain premium quality standards</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Promote sustainable practices</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                Our Values
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Drives Us Forward
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our core values shape every decision we make and guide us in building 
                a platform that truly serves our creative community.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-100 rounded-full">
                        {value.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {value.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                Our Impact
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Growing Together
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These numbers represent the amazing community we've built together 
                and the impact we're making in the world of custom fashion.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {teamStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                Our Journey
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Milestones & Achievements
              </h2>
              <p className="text-xl text-gray-600">
                A look at key moments that shaped TeeDesign Studio into what it is today.
              </p>
            </div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {milestone.year}
                    </div>
                  </div>
                  <Card className="flex-1 border-0 shadow-md">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {milestone.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shirt className="h-16 w-16 mx-auto mb-6 text-white" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of creators who have brought their ideas to life with TeeDesign Studio. 
              Start designing your custom apparel today and be part of our creative community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/design-studio" 
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <Palette className="h-5 w-5 mr-2" />
                Start Designing
              </a>
              <a 
                href="/catalog" 
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                <Shirt className="h-5 w-5 mr-2" />
                Browse Products
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}