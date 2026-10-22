import type { Metadata } from 'next';
import { NewListForm } from './new-list-form';

export const metadata: Metadata = { title: 'Yeni liste' };

export default function NewListPage() {
  return <NewListForm />;
}
