// TypeScript types that mirror the Sanity document schemas

export type SanityQuestion = {
  _key: string
  text: string
  options: string[]
  correctAnswer: string
}

export type SanityQuiz = {
  title: string
  questions: SanityQuestion[]
}

export type SanityLesson = {
  _key: string
  title: string
  description?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any[]
  videoUrl?: string
  isFree: boolean
  position: number
  quiz?: SanityQuiz
}

export type SanityModule = {
  _key: string
  title: string
  description?: string
  position: number
  lessons: SanityLesson[]
}

export type SanityAuthor = {
  _id: string
  firstName: string
  lastName: string
  email: string
  bio?: string
  skills?: string[]
  userId: string
}

export type SanityCourse = {
  _id: string
  _createdAt: string
  _updatedAt: string
  title: string
  slug?: { current: string }
  description?: string
  price: number
  isFree: boolean
  isPublished: boolean
  isFeatured: boolean
  imageUrl?: string
  author?: SanityAuthor
  category?: { _id: string; name: string }
  modules: SanityModule[]
}

export type SanityCourseListItem = {
  _id: string
  _createdAt: string
  title: string
  description?: string
  price: number
  isFree: boolean
  isPublished: boolean
  isFeatured: boolean
  imageUrl?: string
  author?: { firstName: string; lastName: string }
  category?: { _id: string; name: string }
  moduleCount: number
  lessonCount: number
}

export type SanityCategory = {
  _id: string
  name: string
  slug?: { current: string }
}

export type SanityUserProfile = {
  userId: string
  displayName?: string
  avatar?: {
    _type: 'image'
    asset: { _ref: string; _type: 'reference' }
    hotspot?: { x: number; y: number; height: number; width: number }
  }
}

// ─── GROQ queries ────────────────────────────────────────────────────────────

export const coursesListQuery = `
  *[_type == "course" && isPublished == true
    && ($search == "" || title match ($search + "*"))
    && ($categoryId == "" || category->_id == $categoryId)
  ]{
    _id, _createdAt, title, description, price, isFree, isPublished, imageUrl,
    "author": author->{ firstName, lastName },
    "category": category->{ _id, name },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[])
  } | order(_createdAt desc)
`

export const courseByIdQuery = `
  *[_type == "course" && _id == $id][0]{
    _id, _createdAt, _updatedAt, title, slug, description, price, isFree, isPublished, imageUrl,
    "author": author->{ _id, firstName, lastName, email, bio, skills, userId },
    "category": category->{ _id, name },
    modules[]{
      _key, title, description, position,
      lessons[] | order(position asc){
        _key, title, description, content, videoUrl, isFree, position,
        quiz{ title, questions[]{ _key, text, options, correctAnswer } }
      }
    } | order(position asc)
  }
`

export const coursesByAuthorQuery = `
  *[_type == "course" && author->userId == $userId]{
    _id, _createdAt, title, isPublished, isFree, price,
    "category": category->{ _id, name },
    "moduleCount": count(modules)
  } | order(_createdAt desc)
`

export const allCoursesAdminQuery = `
  *[_type == "course"] | order(_createdAt desc) [0...5]{
    _id, _createdAt, title, isPublished, isFree, price,
    "author": author->{ firstName, lastName },
    "category": category->{ _id, name }
  }
`

export const courseCountQuery = `count(*[_type == "course"])`

export const featuredCoursesQuery = `
  *[_type == "course" && isPublished == true && isFeatured == true]{
    _id, _createdAt, title, description, price, isFree, isPublished, isFeatured, imageUrl,
    "author": author->{ firstName, lastName },
    "category": category->{ _id, name },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[])
  } | order(_createdAt desc)
`

export const categoriesQuery = `
  *[_type == "category"] | order(name asc){ _id, name, slug }
`

export const authorByUserIdQuery = `
  *[_type == "author" && userId == $userId][0]{ _id, firstName, lastName, email, bio, skills, userId }
`

// Finds a quiz by its lesson _key (quiz is embedded 1:1 inside each lesson)
export const quizByLessonKeyQuery = `
  *[_type == "course"]{
    modules[]{
      lessons[_key == $key]{
        quiz{ title, questions[]{ _key, text, options, correctAnswer } }
      }
    }
  }
`
