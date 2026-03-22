import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { truncateText } from '@escrow-marketplace/shared';

// TRACED: EM-FE-006 — Zero dangerouslySetInnerHTML
export default function HomePage() {
  const heroDescription = truncateText(
    'Buy and sell with confidence. Our escrow system holds funds securely until both parties confirm satisfaction. Join thousands of trusted users today.',
    120,
  );

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Escrow Marketplace</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {heroDescription}
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <Badge variant="default" className="mb-3">
            Secure
          </Badge>
          <h2 className="text-xl font-semibold mb-2">Escrow Protection</h2>
          <p className="text-gray-600">
            Funds are held securely in escrow until the transaction is complete.
          </p>
        </Card>

        <Card className="p-6">
          <Badge variant="secondary" className="mb-3">
            Verified
          </Badge>
          <h2 className="text-xl font-semibold mb-2">Trusted Sellers</h2>
          <p className="text-gray-600">
            All sellers are verified and rated by the community.
          </p>
        </Card>

        <Card className="p-6">
          <Badge variant="outline" className="mb-3">
            Protected
          </Badge>
          <h2 className="text-xl font-semibold mb-2">Dispute Resolution</h2>
          <p className="text-gray-600">
            Our dispute resolution process ensures fair outcomes for all parties.
          </p>
        </Card>
      </section>

      <section className="text-center">
        <Button>Browse Listings</Button>
      </section>
    </div>
  );
}
