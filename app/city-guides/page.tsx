import { Bus, DollarSign, MapPinned, ShieldCheck, Users } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cityGuides = [
  {
    city: "Melbourne",
    rent: "$260-$420/week",
    card: "Myki",
    suburbs: ["Clayton", "Footscray", "Box Hill", "Carlton", "Brunswick"],
    community: "Join university clubs early and look for Indian grocery stores and community groups.",
    safety: "Avoid paying rent or bond before verifying the listing and inspection.",
  },
  {
    city: "Sydney",
    rent: "$320-$520/week",
    card: "Opal",
    suburbs: ["Parramatta", "Strathfield", "Burwood", "Ultimo", "Kensington"],
    community: "Use student associations, libraries, and local council events to build routine.",
    safety: "Be extra cautious with rushed payments because rent pressure is high.",
  },
  {
    city: "Brisbane",
    rent: "$240-$390/week",
    card: "go card",
    suburbs: ["St Lucia", "Toowong", "Kelvin Grove", "South Bank", "Woolloongabba"],
    community: "Outdoor groups and campus societies are practical ways to meet people.",
    safety: "Check flood history and late transport if working evening shifts.",
  },
  {
    city: "Adelaide",
    rent: "$210-$340/week",
    card: "metroCARD",
    suburbs: ["North Adelaide", "Mawson Lakes", "Unley", "Norwood", "Bowden"],
    community: "Peer programs and cultural community groups can help students settle faster.",
    safety: "Check heating, cooling, room condition, and written agreements before moving in.",
  },
  {
    city: "Perth",
    rent: "$230-$380/week",
    card: "SmartRider",
    suburbs: ["Bentley", "Crawley", "Joondalup", "Victoria Park", "Northbridge"],
    community: "Campus clubs and outdoor groups can make the city feel familiar quickly.",
    safety: "Compare commute time late at night if applying for hospitality jobs.",
  },
  {
    city: "Canberra",
    rent: "$260-$430/week",
    card: "MyWay+",
    suburbs: ["Acton", "Belconnen", "Braddon", "Dickson", "Gungahlin"],
    community: "Student housing networks and campus events are useful for quick connections.",
    safety: "Plan for colder weather, late transport, and verified rental paperwork.",
  },
];

export default function CityGuidesPage() {
  const melbourne = cityGuides[0];

  return (
    <PageShell
      eyebrow="City Survival Guides"
      title="City-by-city student survival guides"
      description="Static MVP cards show the kind of local context students need before choosing suburbs, transport routes, and community support."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_px]">
        <div className="grid gap-5 md:grid-cols-2">
          {cityGuides.map((guide) => (
            <Card key={guide.city} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <MapPinned className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <Badge variant="outline">{guide.rent}</Badge>
                </div>
                <CardTitle className="pt-2">{guide.city}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4 text-sm leading-6">
                  <div className="flex gap-3">
                    <Bus className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <dt className="font-semibold">Transport card</dt>
                      <dd className="text-muted-foreground">{guide.card}</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <DollarSign className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <dt className="font-semibold">Typical student rent range</dt>
                      <dd className="text-muted-foreground">{guide.rent} placeholder</dd>
                    </div>
                  </div>
                  <div>
                    <dt className="font-semibold">Popular student suburbs</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {guide.suburbs.slice(0, 4).map((suburb) => (
                        <Badge key={suburb} variant="secondary">
                          {suburb}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <Users className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <dt className="font-semibold">Community tip</dt>
                      <dd className="text-muted-foreground">{guide.community}</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <dt className="font-semibold">Safety tip</dt>
                      <dd className="text-muted-foreground">{guide.safety}</dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
