// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/page.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Users, Globe, Shield, Star, CheckCircle } from "lucide-react"
import { GlitterBackground, SandstormBackground } from "@/components/glitter-background"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      <GlitterBackground />

      {/* Refined Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm relative z-10 dark:bg-slate-800/95 amoled:bg-black/95 border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Camera className="h-7 w-7 text-slate-700 dark:text-slate-300" />
              <div className="verification-dot absolute -top-1 -right-1"></div>
            </div>
            <span className="text-2xl font-light tracking-wide bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 bg-clip-text text-transparent dark:from-white dark:via-slate-300 dark:to-white">
              Klickhiré
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/login">
              <Button
                variant="outline"
                className="refined-button-secondary border-slate-300 text-slate-700 hover:text-slate-900 font-light"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="refined-button text-white font-light">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Sophisticated Hero Section */}
      <section className="hero-section sandstorm-container py-32 relative flex items-center justify-center min-h-[calc(100vh-65px)]">
        <SandstormBackground />
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in-up">
          <h1 className="hero-title mb-8 animate-slide-in-left">Klickhiré</h1>
          <p className="hero-subtitle mb-16 max-w-4xl mx-auto animate-slide-in-right">
            Connect with exceptional photographers worldwide. Experience seamless collaboration, verified professionals,
            and unparalleled creative excellence.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-fade-in-up-delay">
            {/* Client Card */}
            <Card className="refined-card transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-blue-300">
              <CardHeader className="text-center pb-6">
                <div className="relative mx-auto mb-6 transform transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center">
                    <Users className="h-8 w-8 text-slate-700 dark:text-slate-300" />
                  </div>
                  <div className="verification-dot absolute -top-1 -right-1"></div>
                </div>
                <CardTitle className="text-2xl font-light text-slate-800 dark:text-white mb-2">For Clients</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                  Discover and collaborate with world-class photographers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm">Curated network of verified professionals</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm">Global reach with local expertise</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm">Secure transactions and quality assurance</span>
                </div>
                <Link href="/register?type=client" className="block pt-4">
                  <Button className="refined-button w-full text-white font-light">Join as Client</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Photographer Card */}
            <Card className="refined-card transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-emerald-300">
              <CardHeader className="text-center pb-6">
                <div className="relative mx-auto mb-6 transform transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center">
                    <Camera className="h-8 w-8 text-slate-700 dark:text-slate-300" />
                  </div>
                  <div className="verification-dot absolute -top-1 -right-1"></div>
                </div>
                <CardTitle className="text-2xl font-light text-slate-800 dark:text-white mb-2">
                  For Photographers
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                  Showcase your work and connect with discerning clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm">Access to exclusive opportunities</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm">Professional collaboration network</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm">Reliable payments and support</span>
                </div>
                <Link href="/register?type=photographer" className="block pt-4">
                  <Button className="refined-button w-full text-white font-light">Join as Photographer</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-slate-50/50 to-white py-24 relative z-10 dark:from-slate-900/50 dark:to-slate-800 amoled:from-black/50 amoled:to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-light mb-6 text-slate-800 dark:text-white animate-fade-in-up">Why Choose Klickhiré?</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up-delay">
              Experience the future of creative collaboration with our sophisticated platform designed for professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group p-4 rounded-lg transition-all duration-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/30">
              <div className="relative mx-auto mb-8 w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-3xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500 animate-bounce-in">
                <Globe className="h-10 w-10 text-slate-700 dark:text-slate-300" />
                <div className="verification-dot absolute -top-1 -right-1"></div>
              </div>
              <h3 className="text-2xl font-light mb-4 text-slate-800 dark:text-white">Global Network</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                Connect with exceptional talent across continents with seamless multi-currency support and localized
                expertise
              </p>
            </div>

            <div className="text-center group p-4 rounded-lg transition-all duration-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/30">
              <div className="relative mx-auto mb-8 w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-3xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500 animate-bounce-in-delay-1">
                <Shield className="h-10 w-10 text-slate-700 dark:text-slate-300" />
                <div className="verification-dot absolute -top-1 -right-1"></div>
              </div>
              <h3 className="text-2xl font-light mb-4 text-slate-800 dark:text-white">Trust & Security</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                Advanced security protocols with multi-factor authentication, encrypted communications, and guaranteed
                payment protection
              </p>
            </div>

            <div className="text-center group p-4 rounded-lg transition-all duration-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/30">
              <div className="relative mx-auto mb-8 w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-3xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500 animate-bounce-in-delay-2">
                <Star className="h-10 w-10 text-slate-700 dark:text-slate-300" />
                <div className="verification-dot absolute -top-1 -right-1"></div>
              </div>
              <h3 className="text-2xl font-light mb-4 text-slate-800 dark:text-white">Verified Excellence</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                Every professional is carefully vetted and verified, ensuring only the finest talent joins our exclusive
                community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-slate-900 text-white py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <Camera className="h-6 w-6 text-slate-400" />
            <span className="text-2xl font-light tracking-wide text-white">Klickhiré</span>
            <div className="verification-dot"></div>
          </div>
          <p className="text-center text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            The world's most trusted platform for creative collaboration. Connecting exceptional professionals with
            discerning clients worldwide.
          </p>
        </div>
      </footer>
    </div>
  )
}