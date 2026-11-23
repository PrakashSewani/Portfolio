import Bench from '../components/home/Bench';
import CaseFiles from '../components/home/CaseFiles';
import ColdStart from '../components/home/ColdStart';
import Contact from '../components/home/Contact';
import Layers from '../components/home/Layers';
import Principles from '../components/home/Principles';
import Record from '../components/home/Record';
import { SITE_TITLE, useDocumentMeta } from '../lib/meta';

const DESCRIPTION =
  'Prakash Sewani is a software engineer who builds systems through every layer: machines and industrial automation, infrastructure, backend services, AI, and the interfaces on top.';

export default function Home() {
  useDocumentMeta({ title: SITE_TITLE, description: DESCRIPTION });
  return (
    <>
      <ColdStart />
      <Principles />
      <Layers />
      <CaseFiles />
      <Bench />
      <Record />
      <Contact />
    </>
  );
}
