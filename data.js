
const collectTags = () => {
  let tags = {}

  // perform bucket sort for each tags
  courses.forEach((course) => {
    course.tags.forEach((tag) => {
      if (tag != "") {
        tags[tag] = tags[tag] ? tags[tag] + 1 : 1
      }
    })
  })

  return tags
}

const collectCourses = (search = '', tags = []) => {
  let filteredCourses = courses.reverse().filter((course) => {
    return course.title != ""
  })

  // filters
  const queryString = window.location.search
  const params = new URLSearchParams(queryString)

  if (params.get('search') !== null) {
    let search = params.get('search')
    // perform title search
    const fuse = new Fuse(filteredCourses, { keys: ['title']})
    const result = fuse.search(search)

    filteredCourses = result.map(course => course.item)
  }
  
  if (params.get('tag') !== null) {
    let tag = params.get('tag')
    // perform tag search
    filteredCourses = filteredCourses.filter((course) => {
      return course.tags.includes(tag)
    })
  }

  // if none, then show only first 30
  if (params.get('tag') === null && params.get('search') === null) {
    filteredCourses = filteredCourses.slice(0, 30)
  }


  let tmpCourses = JSON.parse(JSON.stringify(filteredCourses))

  return tmpCourses
}

const displayTags = () => {
  let tags = collectTags()
  let box = document.getElementById('tag-box')

  for (const key in tags) {
    let tag = tags[key]

    let template = document.getElementById('template-tag').cloneNode(true)
    template.id = 'tag-' + key
    template.classList.remove('is-hidden')
    template.href = '?tag=' + encodeURI(key)

    let tagText = document.getElementById('tag-text').cloneNode(true)
    let tagCount = document.getElementById('tag-count').cloneNode(true)

    tagText.id = 'tag-text-' + key
    tagCount.id = 'tag-count-' + key

    tagText.innerHTML = key
    tagCount.innerHTML = tag

    template.appendChild(tagText)
    template.appendChild(tagCount)
    
    box.appendChild(template)
  }
}

const displayCourses = () => {
  let courses = collectCourses()
  let box = document.getElementById('courses-box')

  courses.forEach((course, index) => {
    let template = document.getElementById('template-course').cloneNode(true)
    template.id = 'course-' + index
    template.classList.remove('is-hidden')

    if (index % 2 === 1) {
      template.classList.add('is-dark')
    }

    // break, and create new box
    // plus add an ad-break
    if (index % 15 === 0 && index !== 0) {
      let ads = (document.getElementsByClassName('banner-box')[0]).cloneNode(true)

      box.lastChild.parentNode.insertBefore(ads, box.lastChild.nextSibling)
    }

    let title = template.getElementsByClassName('title')[0]
    title.innerHTML = course.title

    let tagBox = template.getElementsByClassName('tag-box')[0]

    // add tags
    course.tags.forEach((tag, i) => {
      let span = document.createElement('span')
      span.classList.add('tag', 'is-info', 'mr-1')
      span.innerHTML = tag
      
      tagBox.appendChild(span)
    })

    let downloadButton = template.getElementsByClassName('course-download')[0]
    let $target = document.getElementById(downloadButton.dataset.target)

    downloadButton.addEventListener('click', () => {
      displayModal(JSON.stringify(course))
      $target.classList.add('is-active')
    })

    
    box.appendChild(template)
  })

  // filters
  const queryString = window.location.search
  const params = new URLSearchParams(queryString)
  // add warning if no search or tag
  if (params.get('search') === null && params.get('tag') === null) {
    
    // add label on top
    let label = document.createElement('span')
    label.classList.add('tag')
    label.classList.add('is-warning')
    label.classList.add('title')
    label.classList.add('is-size-6')
    label.innerHTML = 'Only the newest 30 courses are shown here. Search something, or select a tag to find specific entries'
    box.prepend(label)
  }
}

let interval = null

const displayModal = (content) => {
  let dataContent = JSON.parse(content)

  let title = document.getElementById('modal-title')
  title.innerHTML = dataContent.title

  let download = document.getElementById('modal-download')
  download.href = dataContent.links.main

  let countdown = 10
  download.innerHTML = 'Your download will begin in ' + countdown + 's'
  
  interval = setInterval(() => {
    countdown--
    download.innerHTML = 'Your download will begin in ' + countdown + 's'

    if (countdown === 0) {
      // enable download button
      download.innerHTML = 'Download'
      download.removeAttribute('disabled')

      clearInterval(interval)
    }
  }, 1000)
}

const addListeners = () => {
  let modalDownload = document.getElementById('modal-download')
  modalDownload.addEventListener('click', () => {
    // disable when click
    modalDownload.setAttribute('disabled', 1)
  })

  let searchBox = document.getElementById('search-box')
  searchBox.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      window.location.href = '?search=' + searchBox.value 
    }
  })
}

window.onload = () => {
  displayTags()
  displayCourses()
  addListeners()
}