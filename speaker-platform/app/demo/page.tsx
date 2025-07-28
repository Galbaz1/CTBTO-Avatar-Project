import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  MessageSquare,
  Search,
  Video,
  UserCircle,
  Mail,
  Bot,
  FileText,
  Award,
  ChevronLeft,
  Send,
  Plus,
  Filter,
  ArrowRight,
  Sparkles,
} from "lucide-react"

export default function DemoPage() {
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
                href="/"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Home
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
        <section className="w-full py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="px-3 py-1 text-sm" variant="secondary">
                  Interactive Demo
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Experience Our Features</h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Try out the key features of our platform before signing up
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12">
          <div className="container px-4 md:px-6">
            <Tabs defaultValue="event-planner" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="event-planner">Event Planners</TabsTrigger>
                  <TabsTrigger value="speakers">Speakers</TabsTrigger>
                  <TabsTrigger value="ai-features">AI Features</TabsTrigger>
                </TabsList>
              </div>

              {/* Event Planner Demo */}
              <TabsContent value="event-planner" className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Event Posting Demo */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <CardTitle>Event Posting</CardTitle>
                      </div>
                      <CardDescription>Create a new event for speakers to discover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <label htmlFor="event-title" className="text-sm font-medium">
                            Event Title
                          </label>
                          <Input id="event-title" placeholder="Annual Tech Conference 2025" />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="event-description" className="text-sm font-medium">
                            Event Description
                          </label>
                          <Textarea
                            id="event-description"
                            placeholder="A three-day conference focusing on emerging technologies in AI and machine learning..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <label htmlFor="event-date" className="text-sm font-medium">
                              Event Date
                            </label>
                            <Input id="event-date" type="date" />
                          </div>
                          <div className="grid gap-2">
                            <label htmlFor="event-location" className="text-sm font-medium">
                              Location
                            </label>
                            <Input id="event-location" placeholder="San Francisco, CA" />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="speaker-requirements" className="text-sm font-medium">
                            Speaker Requirements
                          </label>
                          <Textarea
                            id="speaker-requirements"
                            placeholder="Looking for experts in AI ethics, machine learning applications, and future tech trends..."
                            className="min-h-[80px]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <label htmlFor="speaker-budget" className="text-sm font-medium">
                              Speaker Budget
                            </label>
                            <Input id="speaker-budget" placeholder="$2,000 - $5,000" />
                          </div>
                          <div className="grid gap-2">
                            <label htmlFor="travel-budget" className="text-sm font-medium">
                              Travel & Accommodation
                            </label>
                            <Input id="travel-budget" placeholder="Covered up to $1,500" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Save Draft</Button>
                      <Button>Publish Event</Button>
                    </CardFooter>
                  </Card>

                  {/* Event Management Demo */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>Event Management</CardTitle>
                      </div>
                      <CardDescription>Manage speaker applications and responses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>JD</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="text-sm font-medium">Jane Doe</h4>
                                <p className="text-xs text-muted-foreground">AI Ethics Specialist</p>
                              </div>
                            </div>
                            <Badge>New</Badge>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                            <Button size="sm">Respond</Button>
                          </div>
                        </div>

                        <div className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>MS</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="text-sm font-medium">Michael Smith</h4>
                                <p className="text-xs text-muted-foreground">Machine Learning Engineer</p>
                              </div>
                            </div>
                            <Badge variant="outline">Reviewed</Badge>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                            <Button size="sm">Respond</Button>
                          </div>
                        </div>

                        <div className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>AJ</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="text-sm font-medium">Alex Johnson</h4>
                                <p className="text-xs text-muted-foreground">Future Tech Analyst</p>
                              </div>
                            </div>
                            <Badge variant="secondary">Shortlisted</Badge>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                            <Button size="sm">Respond</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View All Applications (12)
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Event Search & Filtering Demo */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        <CardTitle>Speaker Search & Filtering</CardTitle>
                      </div>
                      <CardDescription>Find the perfect speakers for your event</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input placeholder="Search speakers..." className="flex-1" />
                          <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="cursor-pointer">
                            AI Ethics
                          </Badge>
                          <Badge variant="outline" className="cursor-pointer">
                            Machine Learning
                          </Badge>
                          <Badge variant="outline" className="cursor-pointer">
                            Future Tech
                          </Badge>
                          <Badge variant="outline" className="cursor-pointer">
                            Budget: $1K-$5K
                          </Badge>
                          <Badge variant="secondary" className="cursor-pointer">
                            + Add Filter
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src="/placeholder.svg" />
                                  <AvatarFallback>RB</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="text-sm font-medium">Rachel Brown</h4>
                                  <p className="text-xs text-muted-foreground">AI Ethics Researcher</p>
                                </div>
                              </div>
                              <div className="text-sm font-medium">$3,000</div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              <Badge variant="secondary" className="text-xs">
                                AI Ethics
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                Data Privacy
                              </Badge>
                            </div>
                          </div>

                          <div className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src="/placeholder.svg" />
                                  <AvatarFallback>DW</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="text-sm font-medium">David Wilson</h4>
                                  <p className="text-xs text-muted-foreground">ML Engineer & Educator</p>
                                </div>
                              </div>
                              <div className="text-sm font-medium">$2,500</div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              <Badge variant="secondary" className="text-xs">
                                Machine Learning
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                AI Applications
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">View All Speakers</Button>
                    </CardFooter>
                  </Card>

                  {/* Messaging Demo */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <CardTitle>Instant Messaging & Video Calls</CardTitle>
                      </div>
                      <CardDescription>Connect with speakers directly</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex h-[300px] flex-col rounded-lg border">
                        <div className="flex items-center justify-between border-b p-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>RB</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-sm font-medium">Rachel Brown</h4>
                              <p className="text-xs text-muted-foreground">AI Ethics Researcher</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Video className="mr-2 h-4 w-4" />
                            Start Video Call
                          </Button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                          <div className="space-y-4">
                            <div className="flex items-end gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>RB</AvatarFallback>
                              </Avatar>
                              <div className="rounded-lg bg-muted p-3 text-sm">
                                Hello! I saw your event posting and I'm very interested in speaking at your conference.
                              </div>
                            </div>
                            <div className="flex items-end justify-end gap-2">
                              <div className="rounded-lg bg-primary p-3 text-sm text-primary-foreground">
                                Hi Rachel! Thanks for reaching out. I'd love to discuss the details with you. What
                                topics are you most comfortable speaking about?
                              </div>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>ME</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex items-end gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>RB</AvatarFallback>
                              </Avatar>
                              <div className="rounded-lg bg-muted p-3 text-sm">
                                I specialize in AI ethics, particularly focusing on bias in machine learning algorithms
                                and ethical considerations in AI deployment.
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="border-t p-3">
                          <div className="flex gap-2">
                            <Input placeholder="Type your message..." className="flex-1" />
                            <Button size="icon">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Speaker Demo */}
              <TabsContent value="speakers" className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Speaker Profile Creation Demo */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-primary" />
                        <CardTitle>Speaker Profile Creation</CardTitle>
                      </div>
                      <CardDescription>Create your professional speaker profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">
                              Upload Photo
                            </Button>
                            <Button variant="outline" size="sm">
                              <Video className="mr-2 h-4 w-4" />
                              Add Video Introduction
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                              <label htmlFor="full-name" className="text-sm font-medium">
                                Full Name
                              </label>
                              <Input id="full-name" placeholder="John Doe" />
                            </div>
                            <div className="grid gap-2">
                              <label htmlFor="job-title" className="text-sm font-medium">
                                Professional Title
                              </label>
                              <Input id="job-title" placeholder="AI Ethics Specialist" />
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <label htmlFor="bio" className="text-sm font-medium">
                              Professional Bio
                            </label>
                            <Textarea
                              id="bio"
                              placeholder="A passionate AI ethics specialist with over 10 years of experience..."
                              className="min-h-[120px]"
                            />
                          </div>

                          <div className="grid gap-2">
                            <label htmlFor="speaking-topics" className="text-sm font-medium">
                              Speaking Topics
                            </label>
                            <div className="flex flex-wrap gap-2">
                              <Badge>AI Ethics</Badge>
                              <Badge>Machine Learning</Badge>
                              <Badge>Data Privacy</Badge>
                              <Button variant="outline" size="sm" className="h-6">
                                <Plus className="mr-1 h-3 w-3" /> Add Topic
                              </Button>
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <label htmlFor="past-events" className="text-sm font-medium">
                              Past Speaking Events
                            </label>
                            <div className="space-y-2">
                              <div className="rounded-lg border p-3">
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="text-sm font-medium">TechConf 2024</h4>
                                    <p className="text-xs text-muted-foreground">San Francisco, CA - March 2024</p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Past Event
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Save Draft</Button>
                      <Button>Publish Profile</Button>
                    </CardFooter>
                  </Card>

                  {/* Event Search & Application Demo */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        <CardTitle>Event Search & Application</CardTitle>
                      </div>
                      <CardDescription>Find and apply to speaking opportunities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input placeholder="Search events..." className="flex-1" />
                          <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="cursor-pointer">
                            AI & ML
                          </Badge>
                          <Badge variant="outline" className="cursor-pointer">
                            Tech Conference
                          </Badge>
                          <Badge variant="outline" className="cursor-pointer">
                            United States
                          </Badge>
                          <Badge variant="secondary" className="cursor-pointer">
                            + Add Filter
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="rounded-lg border p-3">
                            <div>
                              <h4 className="text-sm font-medium">Annual Tech Conference 2025</h4>
                              <p className="text-xs text-muted-foreground">San Francisco, CA - June 15-17, 2025</p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  AI Ethics
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Machine Learning
                                </Badge>
                              </div>
                              <p className="mt-2 text-xs">
                                <span className="font-medium">Budget:</span> $2,000 - $5,000
                              </p>
                            </div>
                            <div className="mt-3 flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              <Button size="sm">Apply</Button>
                            </div>
                          </div>

                          <div className="rounded-lg border p-3">
                            <div>
                              <h4 className="text-sm font-medium">Future of AI Summit</h4>
                              <p className="text-xs text-muted-foreground">New York, NY - September 5-7, 2025</p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  AI Ethics
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Future Tech
                                </Badge>
                              </div>
                              <p className="mt-2 text-xs">
                                <span className="font-medium">Budget:</span> $3,000 - $7,000
                              </p>
                            </div>
                            <div className="mt-3 flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              <Button size="sm">Apply</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">View All Events</Button>
                    </CardFooter>
                  </Card>

                  {/* AI Email Generation Demo */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        <CardTitle>AI-Powered Email Generation</CardTitle>
                      </div>
                      <CardDescription>Create professional emails to event planners</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-lg border p-3">
                          <h4 className="text-sm font-medium">Annual Tech Conference 2025</h4>
                          <p className="text-xs text-muted-foreground">San Francisco, CA - June 15-17, 2025</p>
                        </div>

                        <div className="grid gap-2">
                          <label htmlFor="email-tone" className="text-sm font-medium">
                            Email Tone
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="cursor-pointer">
                              Professional
                            </Badge>
                            <Badge className="cursor-pointer">Friendly</Badge>
                            <Badge variant="outline" className="cursor-pointer">
                              Formal
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer">
                              Enthusiastic
                            </Badge>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <label htmlFor="key-points" className="text-sm font-medium">
                            Key Points to Include
                          </label>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input placeholder="Add a key point..." className="flex-1" />
                              <Button variant="outline" size="icon">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="flex items-center gap-1">
                                Past experience with AI ethics talks
                              </Badge>
                              <Badge variant="secondary" className="flex items-center gap-1">
                                Published research on ML bias
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <Button>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Email
                          </Button>
                        </div>

                        <div className="rounded-lg border p-3">
                          <h4 className="mb-2 text-sm font-medium">Generated Email Preview</h4>
                          <div className="rounded-lg bg-muted p-3 text-sm">
                            <p>Dear Annual Tech Conference Organizer,</p>
                            <br />
                            <p>
                              I hope this email finds you well. I was excited to discover your upcoming Annual Tech
                              Conference 2025 in San Francisco and would love to be considered as a speaker for your
                              event.
                            </p>
                            <br />
                            <p>
                              As an AI ethics specialist with extensive experience delivering talks at similar
                              conferences, including TechConf 2024, I believe I could provide valuable insights to your
                              audience. My published research on machine learning bias has been cited in several
                              industry publications, and I'm passionate about making these complex topics accessible to
                              diverse audiences.
                            </p>
                            <br />
                            <p>
                              I'd be delighted to discuss how my expertise aligns with your conference themes and
                              explore potential speaking opportunities.
                            </p>
                            <br />
                            <p>Looking forward to your response,</p>
                            <p>John Doe</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Edit Email</Button>
                      <Button>Send Email</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              {/* AI Features Demo */}
              <TabsContent value="ai-features" className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Event Search AI Demo */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <CardTitle>Event Search AI</CardTitle>
                      </div>
                      <CardDescription>AI suggests relevant events based on your profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-lg border bg-muted/50 p-3">
                          <h4 className="text-sm font-medium">Your Speaker Profile</h4>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              AI Ethics
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Machine Learning
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Data Privacy
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Based on your profile, our AI will find the most relevant events for you.
                          </p>
                        </div>

                        <Button className="w-full">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Find Matching Events
                        </Button>

                        <div className="space-y-3">
                          <div className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">Future of AI Summit</h4>
                              <Badge>98% Match</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">New York, NY - September 5-7, 2025</p>
                            <p className="mt-2 text-xs">
                              <span className="font-medium">Why it matches:</span> Event focuses on AI ethics and data
                              privacy, aligning with your expertise.
                            </p>
                            <div className="mt-3 flex justify-end">
                              <Button size="sm">Apply Now</Button>
                            </div>
                          </div>

                          <div className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">Data Science Conference</h4>
                              <Badge variant="outline">85% Match</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Chicago, IL - August 12-14, 2025</p>
                            <p className="mt-2 text-xs">
                              <span className="font-medium">Why it matches:</span> Event includes machine learning
                              tracks that align with your expertise.
                            </p>
                            <div className="mt-3 flex justify-end">
                              <Button size="sm">Apply Now</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Email Writing Demo */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        <CardTitle>AI Email Writing</CardTitle>
                      </div>
                      <CardDescription>Generate professional pitch emails</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <label htmlFor="event-selection" className="text-sm font-medium">
                            Select Event to Pitch
                          </label>
                          <div className="rounded-lg border p-3">
                            <h4 className="text-sm font-medium">Future of AI Summit</h4>
                            <p className="text-xs text-muted-foreground">New York, NY - September 5-7, 2025</p>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Customize Your Pitch</label>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="cursor-pointer">
                              Include past events
                            </Badge>
                            <Badge className="cursor-pointer">Highlight publications</Badge>
                            <Badge variant="outline" className="cursor-pointer">
                              Mention availability
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer">
                              Discuss compensation
                            </Badge>
                          </div>
                        </div>

                        <Button className="w-full">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Pitch Email
                        </Button>

                        <div className="rounded-lg border p-3">
                          <h4 className="mb-2 text-sm font-medium">AI-Generated Email</h4>
                          <div className="rounded-lg bg-muted p-3 text-sm">
                            <p>Subject: Speaking Opportunity Inquiry - Future of AI Summit 2025</p>
                            <br />
                            <p>Dear Future of AI Summit Organizer,</p>
                            <br />
                            <p>
                              I hope this email finds you well. I'm reaching out to express my interest in speaking at
                              the upcoming Future of AI Summit in New York this September.
                            </p>
                            <br />
                            <p>
                              As an AI ethics specialist with a focus on machine learning and data privacy, I believe my
                              expertise aligns perfectly with your event's themes. My recent publication "Ethical
                              Frameworks for AI Deployment" has been well-received in the industry, and I've spoken at
                              several major conferences including TechConf 2024 in San Francisco.
                            </p>
                            <br />
                            <p>
                              I'm available throughout your event dates and would be happy to discuss potential speaking
                              topics that would resonate with your audience.
                            </p>
                            <br />
                            <p>Looking forward to your response,</p>
                            <p>John Doe</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Edit Email</Button>
                      <Button>Send Email</Button>
                    </CardFooter>
                  </Card>

                  {/* AI Video Creation Demo */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" />
                        <CardTitle>AI Video Creation</CardTitle>
                      </div>
                      <CardDescription>Create professional speaking videos and presentations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <label htmlFor="video-type" className="text-sm font-medium">
                            Select Content Type
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="cursor-pointer">Speaker Introduction</Badge>
                            <Badge variant="outline" className="cursor-pointer">
                              Presentation Slides
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer">
                              Topic Explainer
                            </Badge>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <label htmlFor="video-topic" className="text-sm font-medium">
                            Topic
                          </label>
                          <Input id="video-topic" placeholder="AI Ethics in Healthcare" />
                        </div>

                        <div className="grid gap-2">
                          <label htmlFor="video-style" className="text-sm font-medium">
                            Style Preferences
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="cursor-pointer">
                              Professional
                            </Badge>
                            <Badge className="cursor-pointer">Modern</Badge>
                            <Badge variant="outline" className="cursor-pointer">
                              Minimalist
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer">
                              Colorful
                            </Badge>
                          </div>
                        </div>

                        <Button className="w-full">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Video Content
                        </Button>

                        <div className="relative aspect-video rounded-lg border bg-muted">
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Video className="h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-2 text-sm text-muted-foreground">AI-generated video preview</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Edit Content</Button>
                      <Button>Download</Button>
                    </CardFooter>
                  </Card>

                  {/* AI Bio & Social Media Templates Demo */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>AI Bio & Social Media Templates</CardTitle>
                      </div>
                      <CardDescription>Generate professional content for your profiles</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <label htmlFor="content-type" className="text-sm font-medium">
                            Select Content Type
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="cursor-pointer">Professional Bio</Badge>
                            <Badge variant="outline" className="cursor-pointer">
                              LinkedIn Post
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer">
                              Twitter/X Thread
                            </Badge>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <label htmlFor="bio-focus" className="text-sm font-medium">
                            Content Focus
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="cursor-pointer">Expertise Highlight</Badge>
                            <Badge variant="outline" className="cursor-pointer">
                              Speaking Experience
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer">
                              Publications
                            </Badge>
                          </div>
                        </div>

                        <Button className="w-full">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Content
                        </Button>

                        <div className="rounded-lg border p-3">
                          <h4 className="mb-2 text-sm font-medium">AI-Generated Professional Bio</h4>
                          <div className="rounded-lg bg-muted p-3 text-sm">
                            <p>
                              John Doe is a leading AI ethics specialist with over a decade of experience at the
                              intersection of technology, ethics, and policy. As a sought-after speaker and thought
                              leader, John has delivered compelling presentations at major industry conferences
                              including TechConf 2024.
                            </p>
                            <br />
                            <p>
                              His expertise in machine learning bias, data privacy, and ethical AI deployment has made
                              him a valuable voice in shaping responsible AI practices. John's research has been
                              published in prestigious journals and cited by industry leaders.
                            </p>
                            <br />
                            <p>
                              With a passion for making complex technical concepts accessible to diverse audiences, John
                              brings clarity and insight to the critical conversations around AI's impact on society and
                              business.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Edit Content</Button>
                      <Button>Copy to Clipboard</Button>
                    </CardFooter>
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
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join our platform today and connect with speakers and event planners worldwide
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="inline-flex items-center">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
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
