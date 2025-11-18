import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  Briefcase, 
  User, 
  Search, 
  Send, 
  FileText, 
  BarChart2, 
  ArrowRight,
  Upload,
  Users,
  Filter,
  MessageSquare,
  Zap,
  Shield,
  Smartphone,
  Globe
} from "lucide-react"

export default function Home() {
  const features = [
    { icon: <FileText className="w-5 h-5" />, text: "Create and manage your profile" },
    { icon: <Upload className="w-5 h-5" />, text: "Upload and manage your resume" },
    { icon: <Search className="w-5 h-5" />, text: "Browse thousands of job listings" },
    { icon: <Send className="w-5 h-5" />, text: "One-click application process" },
    { icon: <BarChart2 className="w-5 h-5" />, text: "Track your application status" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4 text-sm font-medium px-4 py-1.5 rounded-full">
          🚀 New: AI-Powered Job Matching
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-indigo-400 mb-6">
          Your Dream Career
          <span className="block text-foreground">Starts Here</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          Connect with top employers or find the perfect candidate in our growing community of professionals.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <Link href="#get-started">
            <Button size="lg" className="px-8 py-6 text-lg font-semibold rounded-xl">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium rounded-xl">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-20">
          {[
            { value: "10K+", label: "Jobs Available" },
            { value: "95%", label: "Success Rate" },
            { value: "24/7", label: "Support" },
            { value: "50K+", label: "Happy Users" },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <p className="text-3xl font-bold text-primary mb-2">{stat.value}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cards Section */}
      <div id="get-started" className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Get Started in Minutes
            <span className="block text-lg font-normal text-muted-foreground mt-2">Choose your path to success</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Job Seeker Card */}
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">I'm a Job Seeker</CardTitle>
                <CardDescription>
                  Find your dream job with our AI-powered matching
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <ul className="space-y-3">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="relative z-10 flex flex-col gap-3">
                <Link href="/auth/register?role=SEEKER" className="w-full">
                  <Button className="w-full py-6 text-base font-semibold rounded-lg">
                    Get Started as Job Seeker
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/login?role=SEEKER" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </Card>

            {/* Employer Card */}
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-2xl">I'm an Employer</CardTitle>
                <CardDescription>
                  Find the perfect candidate for your open positions
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <ul className="space-y-3">
                  {[
                    { icon: <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />, text: "Post unlimited job listings" },
                    { icon: <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />, text: "Access to premium talent pool" },
                    { icon: <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />, text: "Advanced candidate filtering" },
                    { icon: <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />, text: "Direct messaging with candidates" },
                    { icon: <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />, text: "Detailed analytics dashboard" },
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="relative z-10 flex flex-col gap-3">
                <Link href="/auth/register?role=EMPLOYER" className="w-full">
                  <Button variant="outline" className="w-full py-6 text-base font-semibold rounded-lg border-2">
                    Post a Job
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/login?role=EMPLOYER" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="mt-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform is designed to make your job search or hiring process as smooth as possible
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
              title: "Lightning Fast",
              description: "Our platform is optimized for speed, so you can find jobs or candidates in seconds."
            },
            {
              icon: <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />,
              title: "Secure & Private",
              description: "Your data is encrypted and protected with enterprise-grade security measures."
            },
            {
              icon: <Smartphone className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
              title: "Mobile Friendly",
              description: "Access your account and manage everything on the go with our mobile-optimized platform."
            },
            {
              icon: <Users className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
              title: "Dedicated Support",
              description: "Our support team is available 24/7 to help you with any questions or issues."
            },
            {
              icon: <BarChart2 className="w-8 h-8 text-rose-600 dark:text-rose-400" />,
              title: "Smart Analytics",
              description: "Get insights into your job search or hiring process with our advanced analytics."
            },
            {
              icon: <Globe className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
              title: "Global Reach",
              description: "Connect with opportunities or talent from around the world."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-opacity-10 flex items-center justify-center mb-4" style={{ backgroundColor: `${feature.icon.props.className.includes('text-') ? feature.icon.props.className.match(/text-(.*?)-/)[1] : 'blue'}/10` }}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 dark:from-blue-700 dark:to-indigo-800 text-white py-20 mt-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to take the next step?</h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 max-w-2xl mx-auto mb-8">
            Join thousands of professionals and companies who found their perfect match.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/register?role=SEEKER">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl">
                Find Your Dream Job
              </Button>
            </Link>
            <Link href="/auth/register?role=EMPLOYER">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
