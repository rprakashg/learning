import { createClient } from 'next-sanity'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

function key(id: string) {
  return id
}

function lesson(id: string, title: string, position: number, isFree = false) {
  return { _type: 'lesson', _key: key(id), title, position, isFree }
}

const course = {
  _type: 'course',
  title: 'Mastering Bootable Containers',
  slug: { _type: 'slug', current: 'mastering-bootable-containers' },
  description:
    'A comprehensive course covering everything you need to know about bootable containers — from core tools and image signing to SBOM attestation, cloud-init first-boot configuration, image updates, and Greenboot health-check-driven rollbacks.',
  price: 0,
  isFree: true,
  isPublished: false,
  isFeatured: false,
  modules: [
    {
      _type: 'module',
      _key: key('mod-1'),
      title: 'Introduction to Bootable Containers',
      description: 'Understand what bootable containers are, how they compare to traditional OS images, and get your lab environment ready.',
      position: 1,
      lessons: [
        lesson('mod1-les1', 'What are Bootable Containers?', 1, true),
        lesson('mod1-les2', 'How Bootable Containers Differ from Traditional OS Images', 2, true),
        lesson('mod1-les3', 'The Bootable Container Ecosystem Overview', 3),
        lesson('mod1-les4', 'Setting Up Your Lab Environment', 4),
      ],
    },
    {
      _type: 'module',
      _key: key('mod-2'),
      title: 'Container Tools for Bootable Images',
      description: 'Master the core toolchain: bootc, podman, buildah, and skopeo for building and managing bootable OCI images.',
      position: 2,
      lessons: [
        lesson('mod2-les1', 'Introduction to bootc — the Bootable Container Tool', 1, true),
        lesson('mod2-les2', 'Building Bootable Images with podman', 2),
        lesson('mod2-les3', 'Using buildah for Low-Level Image Construction', 3),
        lesson('mod2-les4', 'Writing Containerfiles for Bootable OS Images', 4),
        lesson('mod2-les5', 'Managing Images with skopeo', 5),
      ],
    },
    {
      _type: 'module',
      _key: key('mod-3'),
      title: 'Container Image Signing',
      description: 'Learn how to sign and verify bootable container images using cosign and the Sigstore ecosystem.',
      position: 3,
      lessons: [
        lesson('mod3-les1', 'Why Image Signing Matters for OS Security', 1, true),
        lesson('mod3-les2', 'Introduction to cosign and Sigstore', 2),
        lesson('mod3-les3', 'Signing Bootable Container Images', 3),
        lesson('mod3-les4', 'Verifying Image Signatures Before Deployment', 4),
        lesson('mod3-les5', 'Integrating Signing into CI/CD Pipelines', 5),
      ],
    },
    {
      _type: 'module',
      _key: key('mod-4'),
      title: 'SBOM and Attestation',
      description: 'Generate Software Bills of Materials, attach them as attestations, and enforce SBOM policies at deploy time.',
      position: 4,
      lessons: [
        lesson('mod4-les1', 'What is a Software Bill of Materials (SBOM)?', 1, true),
        lesson('mod4-les2', 'Generating SBOMs with syft', 2),
        lesson('mod4-les3', 'Attaching SBOMs as Attestations with cosign', 3),
        lesson('mod4-les4', 'Verifying Attestations at Deploy Time', 4),
        lesson('mod4-les5', 'SBOM Policy Enforcement with policy-controller', 5),
      ],
    },
    {
      _type: 'module',
      _key: key('mod-5'),
      title: 'First Boot Configuration with cloud-init',
      description: 'Use cloud-init to automate network setup, user provisioning, storage configuration, and custom first-boot scripts.',
      position: 5,
      lessons: [
        lesson('mod5-les1', 'cloud-init Architecture and How It Works', 1, true),
        lesson('mod5-les2', 'Writing cloud-init User Data for Bootable Containers', 2),
        lesson('mod5-les3', 'Network, User, and Storage Configuration', 3),
        lesson('mod5-les4', 'Running Custom Scripts on First Boot', 4),
        lesson('mod5-les5', 'Debugging cloud-init on Bootable Systems', 5),
      ],
    },
    {
      _type: 'module',
      _key: key('mod-6'),
      title: 'Image Updates and Rollouts',
      description: 'Understand how bootc manages OCI-based OS updates, stage and apply updates, and design safe rollout strategies.',
      position: 6,
      lessons: [
        lesson('mod6-les1', 'How bootc Handles OCI-Based OS Updates', 1, true),
        lesson('mod6-les2', 'Staging and Applying Image Updates', 2),
        lesson('mod6-les3', 'Rolling Updates Across a Fleet', 3),
        lesson('mod6-les4', 'Pinning and Locking Image Versions', 4),
        lesson('mod6-les5', 'Rollback Strategies and Recovery', 5),
      ],
    },
    {
      _type: 'module',
      _key: key('mod-7'),
      title: 'Greenboot — Health Checks and Automatic Rollback',
      description: 'Write Greenboot health check scripts, configure boot health thresholds, and enable automatic rollback on failures.',
      position: 7,
      lessons: [
        lesson('mod7-les1', 'Introduction to Greenboot and Its Role in Bootable Systems', 1, true),
        lesson('mod7-les2', 'Writing Health Check Scripts', 2),
        lesson('mod7-les3', 'Configuring Boot Health Thresholds', 3),
        lesson('mod7-les4', 'Automatic Rollback on Boot Failure', 4),
        lesson('mod7-les5', 'Monitoring Boot Health Across Devices', 5),
      ],
    },
    {
      _type: 'module',
      _key: key('mod-8'),
      title: 'Production Readiness and Best Practices',
      description: 'Bring it all together: harden images for production, set up observability, manage fleets at scale, and build a complete CI/CD pipeline.',
      position: 8,
      lessons: [
        lesson('mod8-les1', 'Designing Immutable OS Images for Production', 1),
        lesson('mod8-les2', 'Security Hardening Bootable Container Images', 2),
        lesson('mod8-les3', 'Observability: Logging and Metrics from Bootable Systems', 3),
        lesson('mod8-les4', 'Managing a Fleet of Bootable Containers at Scale', 4),
        lesson('mod8-les5', 'CI/CD Pipeline for Build, Sign, Attest, and Deploy', 5),
      ],
    },
  ],
}

async function main() {
  console.log('Checking for existing course...')
  const existing = await client.fetch(
    `*[_type == "course" && slug.current == "mastering-bootable-containers"][0]{ _id }`
  )
  if (existing?._id) {
    console.log(`Course already exists (${existing._id}). Aborting to avoid duplicates.`)
    process.exit(0)
  }

  console.log('Creating course: Mastering Bootable Containers...')
  const result = await client.create(course)
  console.log(`Created course with id: ${result._id}`)
  console.log(`  Modules: ${course.modules.length}`)
  console.log(`  Total lessons: ${course.modules.reduce((sum, m) => sum + m.lessons.length, 0)}`)
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
