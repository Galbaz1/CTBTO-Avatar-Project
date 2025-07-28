import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Calendar,
  MessageSquare,
  Search,
  Video,
  UserCircle,
  Mail,
  Bot,
  FileText,
  Database,
  Store,
  Users,
  Globe,
  ShoppingBag,
  Award,
  BookOpen,
  Clock,
  ExternalLink,
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center text-xl font-bold">
            <Award className="h-6 w-6 text-primary" />
            <span>SpeakerConnect</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Features
              </Link>
              <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Pricing
              </Link>
              <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                About
              </Link>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                Log In
              </Button>
              <Button size="sm" className="hidden sm:flex">
                Sign Up
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Connecting Speakers & Event Planners
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  The Ultimate Platform for Speakers & Event Planners
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Connect, collaborate, and create memorable events with our AI-powered platform designed specifically
                  for public speakers and event organizers.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="inline-flex items-center" asChild>
                    <Link href="/demo">
                      Try Demo
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/demo">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-[500px] aspect-video rounded-xl bg-gradient-to-br from-primary/20 via-muted/30 to-muted border shadow-xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Link href="/demo" className="text-center space-y-2 hover:opacity-80 transition-opacity">
                      <Video className="h-12 w-12 mx-auto text-primary" />
                      <p className="text-sm font-medium">Platform Demo</p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="px-3 py-1 text-sm" variant="secondary">
                  Platform Features
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Everything You Need in One Place
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our comprehensive platform offers tools for both event planners and public speakers, powered by AI to
                  enhance your experience.
                </p>
              </div>
            </div>

            <Tabs defaultValue="event-planner" className="mt-12">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="event-planner">Event Planners</TabsTrigger>
                  <TabsTrigger value="speakers">Speakers</TabsTrigger>
                  <TabsTrigger value="ai-features">AI Features</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="event-planner" className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Calendar className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>Event Posting</CardTitle>
                        <CardDescription>
                          Post events with theme, speaker requirements, and budget details
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Create detailed event listings with all necessary information for potential speakers, including
                        theme, requirements, budget for speakers and travel expenses.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/demo">
                            Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>Event Management</CardTitle>
                        <CardDescription>Manage event details, speaker applications, and responses</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Easily manage all aspects of your events, track speaker applications, and organize responses in
                        one centralized location.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/demo">
                            Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Search className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>Event Search & Filtering</CardTitle>
                        <CardDescription>Find speakers based on themes, budgets, and other criteria</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Search for the perfect speakers using advanced filters based on event themes, budget
                        constraints, and other specific requirements.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/demo">
                            Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <MessageSquare className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>Instant Messaging & Video Calls</CardTitle>
                        <CardDescription>Connect with speakers via messages and video calls</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Communicate directly with potential speakers through our integrated messaging system and conduct
                        video interviews to find the perfect match.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/demo">
                            Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="speakers" className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <UserCircle className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>Speaker Profile Creation</CardTitle>
                        <CardDescription>Create customized profiles with bio, past events, and videos</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Build a comprehensive speaker profile showcasing your expertise, past speaking engagements,
                        videos of previous talks, and a personalized video introduction.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/demo">
                            Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Search className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>Event Search & Application</CardTitle>
                        <CardDescription>Browse events and apply with messages or AI-generated emails</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Discover relevant speaking opportunities and easily apply to events with personalized messages
                        or AI-generated professional emails.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/demo">
                            Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Mail className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>AI-Powered Email Generation</CardTitle>
                        <CardDescription>Generate professional emails to event planners</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Create compelling, professional emails to event planners with AI assistance, saving time while
                        maintaining a personalized touch.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/demo">
                            Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <MessageSquare className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>Instant Messaging & Video Calls</CardTitle>
                        <CardDescription>Communicate with event planners in real-time</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Connect directly with event planners through our integrated messaging system and conduct video
                        calls to discuss opportunities in detail.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/demo">
                            Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ai-features" className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Bot className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>Event Search AI</CardTitle>
                        <CardDescription>AI suggests relevant events based on speaker profiles</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Our AI analyzes your speaker profile and preferences to suggest the most relevant speaking
                        opportunities, saving you time in your search.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/demo">
                            Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Mail className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>AI Email Writing</CardTitle>
                        <CardDescription>Automatically generate emails for speakers to pitch to events</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Our AI crafts personalized, professional emails for speakers to pitch to event planners,
                        highlighting your unique value proposition.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/demo">
                            Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Video className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>AI Video Creation</CardTitle>
                        <CardDescription>Create speaking videos and presentations with AI tools</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Leverage AI tools to create professional speaking videos, presentation slides, and PowerPoint
                        presentations that showcase your expertise.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/demo">
                            Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>AI Bio & Social Media Templates</CardTitle>
                        <CardDescription>Generate professional bios and social media content</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Create compelling speaker bios and social media content with AI assistance, ensuring your
                        professional presence is consistent and engaging.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/demo">
                            Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Additional Platform Features
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover more powerful tools to enhance your experience
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Database className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Event Database</CardTitle>
                    <CardDescription>Searchable database of events for speakers</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Access a comprehensive, searchable database of events for speakers to explore and apply to.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/demo">
                        Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Learning University</CardTitle>
                    <CardDescription>Educational videos for speakers and planners</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A dedicated space for speakers and planners to watch pre-recorded educational videos to enhance
                    their skills.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/demo">
                        Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Store className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Bookstore</CardTitle>
                    <CardDescription>Platform for speakers to sell books directly</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A platform feature where speakers and authors can sell their books directly to visitors and event
                    attendees.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/demo">
                        Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Online Status</CardTitle>
                    <CardDescription>Real-time availability display</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Display real-time availability of both event planners and speakers to facilitate immediate
                    communication.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/demo">
                        Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Globe className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>International Event Section</CardTitle>
                    <CardDescription>Dedicated section for international events</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A dedicated section for international events, including cruises and global speaking opportunities.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/demo">
                        Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Merchandise & Affiliate Links</CardTitle>
                    <CardDescription>Sell merchandise and affiliate products</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Ability for speakers to sell merchandise and affiliate links through the platform, creating
                    additional revenue streams.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/demo">
                        Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Community Building</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Connect with other speakers and event planners
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mt-12">
              <Card className="col-span-full">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Speaker & Planner Community</CardTitle>
                    <CardDescription>A space for interaction, idea sharing, and collaboration</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Join our vibrant community where both speakers and planners can interact, share ideas, and
                    collaborate on events. Build valuable connections, get feedback on your presentations, and stay
                    updated on industry trends.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/demo">
                        Try Demo <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center mt-12">
              <div className="max-w-3xl text-center">
                <p className="text-muted-foreground mb-6">
                  This platform offers a comprehensive solution to foster connections between speakers and event
                  planners, while providing resources and tools that enhance both the learning and earning potential of
                  users.
                </p>
                <Button size="lg" className="mx-auto" asChild>
                  <Link href="/demo">
                    Try Interactive Demo
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 SpeakerConnect. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
