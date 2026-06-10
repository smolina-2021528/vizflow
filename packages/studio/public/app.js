const visualizationTypes = {
  chart: {
    title: 'Chart',
    description:
      'Build bar, line, pie, scatter, area, horizontal bar and doughnut charts.',
    nextStep: 'Next: dynamic chart form with title, axes, dimensions, theme and data source.',
  },
  table: {
    title: 'Table',
    description:
      'Create searchable, sortable and paginated tables from CSV, JSON or manual data.',
    nextStep: 'Next: dynamic table form with columns, pagination, density and formatting.',
  },
  heatmap: {
    title: 'Heatmap',
    description:
      'Generate matrix-style visualizations for intensity, performance and activity grids.',
    nextStep: 'Next: dynamic heatmap form with rows, columns, values and color scale.',
  },
  components: {
    title: 'Components',
    description:
      'Create dashboard-ready metric cards and progress bars for KPI reporting.',
    nextStep: 'Next: dynamic component form for metric cards and progress bars.',
  },
}

const typeButtons = Array.from(document.querySelectorAll('[data-viz-type]'))
const selectedTitle = document.querySelector('[data-selected-title]')
const selectedDescription = document.querySelector('[data-selected-description]')
const selectedNextStep = document.querySelector('[data-selected-next-step]')
const continueButton = document.querySelector('[data-continue-button]')

let selectedType = 'chart'

function setSelectedType(type) {
  const option = visualizationTypes[type]

  if (!option) {
    return
  }

  selectedType = type

  for (const button of typeButtons) {
    const isSelected = button.dataset.vizType === type

    button.classList.toggle('type-card-selected', isSelected)
    button.setAttribute('aria-pressed', String(isSelected))
  }

  if (selectedTitle) {
    selectedTitle.textContent = option.title
  }

  if (selectedDescription) {
    selectedDescription.textContent = option.description
  }

  if (selectedNextStep) {
    selectedNextStep.textContent = option.nextStep
  }

  if (continueButton) {
    continueButton.textContent = `Continue with ${option.title}`
  }
}

for (const button of typeButtons) {
  button.addEventListener('click', () => {
    setSelectedType(button.dataset.vizType)
  })
}

continueButton?.addEventListener('click', () => {
  const studioWorkspace = document.querySelector('#studio-workspace')

  studioWorkspace?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
})

setSelectedType(selectedType)