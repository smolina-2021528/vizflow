const visualizationTypes = {
  chart: {
    title: 'Chart',
    description:
      'Build bar, line, pie, scatter, area, horizontal bar and doughnut charts.',
    nextStep: 'Configure the chart parameters and generate the HTML output.',
    continueLabel: 'Configure Chart',
  },
  table: {
    title: 'Table',
    description:
      'Create searchable, sortable and paginated tables from CSV, JSON or manual data.',
    nextStep: 'The table form will be added in the next Studio commits.',
    continueLabel: 'View Table Setup',
  },
  heatmap: {
    title: 'Heatmap',
    description:
      'Generate matrix-style visualizations for intensity, performance and activity grids.',
    nextStep: 'The heatmap form will be added in the next Studio commits.',
    continueLabel: 'View Heatmap Setup',
  },
  components: {
    title: 'Components',
    description:
      'Create dashboard-ready metric cards and progress bars for KPI reporting.',
    nextStep: 'The components form will be added in the next Studio commits.',
    continueLabel: 'View Components Setup',
  },
}

const typeButtons = Array.from(document.querySelectorAll('[data-viz-type]'))
const selectedTitle = document.querySelector('[data-selected-title]')
const selectedDescription = document.querySelector('[data-selected-description]')
const selectedNextStep = document.querySelector('[data-selected-next-step]')
const continueButton = document.querySelector('[data-continue-button]')
const configPanel = document.querySelector('[data-config-panel]')

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
    continueButton.textContent = option.continueLabel
  }

  renderConfigurationPanel(type)
}

function renderConfigurationPanel(type) {
  if (!configPanel) {
    return
  }

  if (type === 'chart') {
    configPanel.innerHTML = getChartFormTemplate()
    bindChartForm()
    return
  }

  configPanel.innerHTML = getComingSoonTemplate(type)
}

function getComingSoonTemplate(type) {
  const option = visualizationTypes[type]

  return `
    <div class="config-card empty-config-card">
      <div>
        <p class="eyebrow">Step 2</p>
        <h3>${option.title} setup coming next</h3>
        <p>
          This Studio section is reserved for the ${option.title.toLowerCase()}
          configuration form. For now, continue with Chart to validate the first
          complete dynamic form flow.
        </p>
      </div>
    </div>
  `
}

function getChartFormTemplate() {
  return `
    <div class="config-card">
      <div class="config-heading">
        <div>
          <p class="eyebrow">Step 2</p>
          <h3>Configure your chart.</h3>
          <p>
            Fill the same core parameters used by the CLI. Studio will send this
            configuration to the local server and generate real VizFlow HTML.
          </p>
        </div>
      </div>

      <form class="studio-form" data-chart-form>
        <fieldset>
          <legend>Chart basics</legend>

          <div class="form-grid">
            <label class="field">
              <span>Chart type</span>
              <select name="chartType">
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
                <option value="scatter">Scatter</option>
                <option value="area">Area</option>
                <option value="horizontalBar">Horizontal Bar</option>
                <option value="doughnut">Doughnut</option>
              </select>
            </label>

            <label class="field">
              <span>Theme</span>
              <select name="theme">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="hot">Hot</option>
                <option value="cold">Cold</option>
                <option value="corporate">Corporate</option>
                <option value="emerald">Emerald</option>
                <option value="midnight">Midnight</option>
                <option value="sunset">Sunset</option>
                <option value="ocean" selected>Ocean</option>
                <option value="rose">Rose</option>
                <option value="forest">Forest</option>
              </select>
            </label>

            <label class="field">
              <span>Title</span>
              <input name="title" type="text" value="Monthly Sales" />
            </label>

            <label class="field">
              <span>Subtitle</span>
              <input name="subtitle" type="text" value="Revenue by month" />
            </label>

            <label class="field">
              <span>X key</span>
              <input name="xKey" type="text" value="label" />
            </label>

            <label class="field">
              <span>Y key</span>
              <input name="yKey" type="text" value="value" />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Data</legend>

          <div class="form-grid">
            <label class="field">
              <span>Data source</span>
              <select name="dataSource" data-data-source-select>
                <option value="manual" selected>Manual / inline JSON</option>
                <option value="csv" disabled>CSV upload coming next</option>
                <option value="json" disabled>JSON upload coming next</option>
              </select>
            </label>

            <label class="field">
              <span>Output filename</span>
              <input name="filename" type="text" value="chart.html" />
            </label>

            <label class="field field-full">
              <span>Inline rows</span>
              <textarea name="rows" rows="7">[
  { "label": "Jan", "value": 1200 },
  { "label": "Feb", "value": 950 },
  { "label": "Mar", "value": 1400 }
]</textarea>
            </label>
          </div>

          <p class="field-help" data-data-source-note>
            Use JSON rows for now. CSV and JSON file upload will be connected in
            the next data upload commit.
          </p>
        </fieldset>

        <fieldset>
          <legend>Format and appearance</legend>

          <div class="form-grid">
            <label class="field">
              <span>Value format</span>
              <select name="formatType" data-format-select>
                <option value="none" selected>None</option>
                <option value="number">Number</option>
                <option value="currency">Currency</option>
                <option value="percent">Percent</option>
                <option value="compact">Compact number</option>
              </select>
            </label>

            <label class="field">
              <span>Locale</span>
              <input name="locale" type="text" value="en-US" />
            </label>

            <label class="field" data-currency-field>
              <span>Currency</span>
              <input name="currency" type="text" value="USD" />
            </label>

            <label class="field">
              <span>Maximum fraction digits</span>
              <input name="maximumFractionDigits" type="number" min="0" max="20" value="1" />
            </label>

            <label class="field">
              <span>Width</span>
              <input name="width" type="number" min="100" value="600" />
            </label>

            <label class="field">
              <span>Height</span>
              <input name="height" type="number" min="100" value="400" />
            </label>

            <label class="field">
              <span>Card</span>
              <select name="card">
                <option value="true" selected>Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </label>

            <label class="field">
              <span>Shadow</span>
              <select name="shadow">
                <option value="true" selected>Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </label>

            <label class="field">
              <span>Radius</span>
              <select name="rounded">
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg" selected>Large</option>
                <option value="xl">Extra large</option>
                <option value="none">None</option>
              </select>
            </label>
          </div>
        </fieldset>

        <div class="form-actions">
          <button class="button button-primary" type="submit" data-generate-button>
            Generate Chart HTML
          </button>

          <p class="form-status" data-form-status>
            Ready to generate.
          </p>
        </div>
      </form>
    </div>

    <div class="config-card config-summary-card">
      <div class="config-heading">
        <div>
          <p class="eyebrow">Live summary</p>
          <h3>Chart config preview.</h3>
        </div>
      </div>

      <pre class="config-summary" data-chart-summary></pre>
    </div>

    <div class="config-card preview-card" data-generated-preview hidden>
      <div class="config-heading">
        <div>
          <p class="eyebrow">Step 3</p>
          <h3>Preview generated chart.</h3>
          <p data-generated-meta>
            Generate chart HTML to load the preview here.
          </p>
        </div>
      </div>

      <div class="preview-frame-shell">
        <iframe
          class="preview-frame"
          title="VizFlow generated chart preview"
          sandbox="allow-scripts"
          data-preview-frame
        ></iframe>
      </div>
    </div>

    <div class="config-card config-summary-card" data-generated-output hidden>
      <div class="config-heading">
        <div>
          <p class="eyebrow">Generated HTML</p>
          <h3>Output source.</h3>
          <p>
            This is the standalone HTML generated by VizFlow Core.
          </p>
        </div>
      </div>

      <pre class="config-summary" data-generated-html></pre>
    </div>
  `
}

function parseInlineRows(rawValue) {
  let parsed

  try {
    parsed = JSON.parse(rawValue)
  } catch {
    throw new Error('Inline rows must be valid JSON.')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Inline rows must be a JSON array.')
  }

  if (parsed.length === 0) {
    throw new Error('Inline rows must contain at least one row.')
  }

  return parsed
}

function readOptionalNumber(value) {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : undefined
}

function buildValueFormat(formData) {
  const formatType = String(formData.get('formatType') ?? 'none')

  if (formatType === 'none') {
    return undefined
  }

  const format = {
    type: formatType,
    locale: String(formData.get('locale') ?? 'en-US'),
    maximumFractionDigits: readOptionalNumber(
      formData.get('maximumFractionDigits')
    ),
  }

  if (formatType === 'currency') {
    format.currency = String(formData.get('currency') ?? 'USD').toUpperCase()
  }

  return format
}

function buildChartGenerationPayload(form) {
  const formData = new FormData(form)
  const valueFormat = buildValueFormat(formData)
  const rows = parseInlineRows(String(formData.get('rows') ?? '[]'))

  return {
    chartConfig: {
      type: String(formData.get('chartType') ?? 'bar'),
      title: String(formData.get('title') ?? ''),
      subtitle: String(formData.get('subtitle') ?? ''),
      xKey: String(formData.get('xKey') ?? 'label'),
      yKey: String(formData.get('yKey') ?? 'value'),
      width: readOptionalNumber(formData.get('width')),
      height: readOptionalNumber(formData.get('height')),
      appearance: {
        card: String(formData.get('card')) === 'true',
        shadow: String(formData.get('shadow')) === 'true',
        rounded: String(formData.get('rounded') ?? 'lg'),
      },
      format: valueFormat
        ? {
            y: valueFormat,
            tooltip: valueFormat,
          }
        : undefined,
      data: {
        kind: 'inline',
        rows,
      },
    },
    outputOptions: {
      title: 'VizFlow Chart',
      theme: String(formData.get('theme') ?? 'ocean'),
      includeChartJs: true,
      filename: String(formData.get('filename') ?? 'chart.html'),
    },
  }
}

function bindChartForm() {
  const form = document.querySelector('[data-chart-form]')
  const formatSelect = document.querySelector('[data-format-select]')
  const currencyField = document.querySelector('[data-currency-field]')
  const dataSourceSelect = document.querySelector('[data-data-source-select]')
  const dataSourceNote = document.querySelector('[data-data-source-note]')
  const status = document.querySelector('[data-form-status]')
  const generateButton = document.querySelector('[data-generate-button]')
  const generatedPreview = document.querySelector('[data-generated-preview]')
  const generatedOutput = document.querySelector('[data-generated-output]')
  const generatedMeta = document.querySelector('[data-generated-meta]')
  const generatedHtml = document.querySelector('[data-generated-html]')
  const previewFrame = document.querySelector('[data-preview-frame]')

  if (!form) {
    return
  }

  function updateFormatFields() {
    if (!currencyField || !formatSelect) {
      return
    }

    currencyField.classList.toggle(
      'field-hidden',
      formatSelect.value !== 'currency'
    )
  }

  function updateDataSourceNote() {
    if (!dataSourceSelect || !dataSourceNote) {
      return
    }

    if (dataSourceSelect.value === 'manual') {
      dataSourceNote.textContent =
        'Use JSON rows for now. CSV and JSON file upload will be connected in the next data upload commit.'
      return
    }

    dataSourceNote.textContent =
      'File upload is planned for the next commits. This selection is already represented in the form state.'
  }

  function syncSummary() {
    renderChartSummary(form)
  }

  form.addEventListener('input', syncSummary)
  form.addEventListener('change', () => {
    updateFormatFields()
    updateDataSourceNote()
    syncSummary()
  })

  form.addEventListener('submit', async event => {
    event.preventDefault()

    try {
      if (status) {
        status.textContent = 'Generating chart HTML...'
      }

      if (generateButton) {
        generateButton.disabled = true
      }

      const payload = buildChartGenerationPayload(form)

      const response = await fetch('/api/generate/chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? 'Could not generate chart HTML.')
      }

      window.vizflowStudioLastGeneration = result

      if (generatedPreview) {
        generatedPreview.hidden = false
      }

      if (generatedOutput) {
        generatedOutput.hidden = false
      }

      if (generatedMeta) {
        generatedMeta.textContent = `Generated ${result.filename} successfully. Size: ${result.bytes} bytes.`
      }

      if (generatedHtml) {
        generatedHtml.textContent = result.html
      }

      if (previewFrame) {
        previewFrame.srcdoc = result.html
      }

      if (status) {
        status.textContent = 'Chart HTML generated and preview loaded.'
      }

      generatedPreview?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      if (status) {
        status.textContent = `Error: ${message}`
      }
    } finally {
      if (generateButton) {
        generateButton.disabled = false
      }

      syncSummary()
    }
  })

  updateFormatFields()
  updateDataSourceNote()
  syncSummary()
}

function renderChartSummary(form) {
  const summary = document.querySelector('[data-chart-summary]')

  if (!summary) {
    return
  }

  const formData = new FormData(form)
  const valueFormat = buildValueFormat(formData)

  let rowsSummary = 'Invalid JSON'

  try {
    rowsSummary = `${parseInlineRows(String(formData.get('rows') ?? '[]')).length} rows`
  } catch {
    rowsSummary = 'Invalid JSON'
  }

  const chartConfig = {
    type: String(formData.get('chartType') ?? 'bar'),
    title: String(formData.get('title') ?? ''),
    subtitle: String(formData.get('subtitle') ?? ''),
    xKey: String(formData.get('xKey') ?? 'label'),
    yKey: String(formData.get('yKey') ?? 'value'),
    width: readOptionalNumber(formData.get('width')),
    height: readOptionalNumber(formData.get('height')),
    appearance: {
      card: String(formData.get('card')) === 'true',
      shadow: String(formData.get('shadow')) === 'true',
      rounded: String(formData.get('rounded') ?? 'lg'),
    },
    format: valueFormat
      ? {
          y: valueFormat,
          tooltip: valueFormat,
        }
      : undefined,
    data: {
      kind: 'inline',
      rows: rowsSummary,
    },
  }

  const outputOptions = {
    title: 'VizFlow Chart',
    theme: String(formData.get('theme') ?? 'ocean'),
    includeChartJs: true,
    filename: String(formData.get('filename') ?? 'chart.html'),
    dataSource: String(formData.get('dataSource') ?? 'manual'),
  }

  summary.textContent = JSON.stringify(
    {
      chartConfig,
      outputOptions,
    },
    null,
    2
  )
}

for (const button of typeButtons) {
  button.addEventListener('click', () => {
    setSelectedType(button.dataset.vizType)
  })
}

continueButton?.addEventListener('click', () => {
  configPanel?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
})

setSelectedType(selectedType)