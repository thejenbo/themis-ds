/**
 * Docs page template for every component (wired up in preview.tsx).
 *
 * Renders the component's `<Name>.docs.ts` contract (passed as `parameters.themis`) in a fixed
 * order, so every page reads the same way for humans, and the DOM is predictable for agents
 * and the Figma sync. Section headings double as stable anchors (#usage, #anatomy, …).
 */
import { Controls, Description, Primary, Stories, Subtitle, Title, useOf } from '@storybook/addon-docs/blocks';
import type { CSSProperties, ReactNode } from 'react';

import type { ComponentDocs } from '../../src/docs/component-docs';
import tokenData from '../../src/tokens/tokens.json';

const tokenById = new Map(tokenData.tokens.map((t) => [t.id, t]));

const s = {
  badge: (status: string): CSSProperties => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    background: { stable: '#dcfce7', beta: '#dbeafe', draft: '#fef9c3', deprecated: '#fee2e2' }[status] ?? '#eee',
    color: '#1f2937',
  }),
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 } as CSSProperties,
  cell: { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'top' } as CSSProperties,
  swatch: (value: string): CSSProperties => ({
    display: 'inline-block',
    width: 14,
    height: 14,
    borderRadius: 3,
    marginRight: 6,
    verticalAlign: 'middle',
    background: value,
    border: '1px solid rgba(0,0,0,.15)',
  }),
  cols: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 } as CSSProperties,
};

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} data-themis-section={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <table style={s.table}>
      <thead>
        <tr>{head.map((h) => <th key={h} style={s.cell}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => <td key={j} style={s.cell}>{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

function ThemisSections({ docs }: { docs: ComponentDocs }) {
  return (
    <>
      <Section id="usage" title="Usage">
        <div style={s.cols}>
          <div>
            <h3>When to use</h3>
            <ul>{docs.usage.whenToUse.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div>
            <h3>When not to use</h3>
            <ul>
              {docs.usage.whenNotToUse.map((x) => (
                <li key={x.scenario}>
                  {x.scenario}
                  {x.useInstead && <> Use <strong>{x.useInstead}</strong> instead.</>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="variants" title="Variants">
        {Object.entries(docs.variants).map(([prop, values]) => (
          <div key={prop}>
            <h3><code>{prop}</code></h3>
            <Table head={['Value', 'When to choose it']} rows={Object.entries(values).map(([v, d]) => [<code>{v}</code>, d])} />
          </div>
        ))}
      </Section>

      <Section id="anatomy" title="Anatomy">
        <Table
          head={['Part', 'Description', 'Required']}
          rows={docs.anatomy.map((a) => [<strong>{a.part}</strong>, a.description, a.required ? 'Yes' : 'Optional'])}
        />
      </Section>

      <Section id="guidelines" title="Guidelines">
        <div style={s.cols}>
          <div>
            <h3>✅ Do</h3>
            <ul>{docs.guidelines.do.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div>
            <h3>⛔ Don’t</h3>
            <ul>{docs.guidelines.dont.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
        {docs.content && (
          <>
            <h3>Content</h3>
            <ul>{docs.content.guidance.map((x) => <li key={x}>{x}</li>)}</ul>
          </>
        )}
      </Section>

      <Section id="accessibility" title="Accessibility">
        {docs.base && (
          <p>
            Built on React Aria <a href={docs.base.docsUrl}><code>{docs.base.component}</code></a>, which provides:
          </p>
        )}
        <ul>{docs.accessibility.providedByBase.map((x) => <li key={x}>{x}</li>)}</ul>
        <h3>Keyboard</h3>
        <Table head={['Keys', 'Action']} rows={docs.accessibility.keyboard.map((k) => [<kbd>{k.keys}</kbd>, k.action])} />
        <h3>Your responsibilities</h3>
        <ul>{docs.accessibility.requirements.map((x) => <li key={x}>{x}</li>)}</ul>
      </Section>

      <Section id="tokens" title="Design tokens">
        <Table
          head={['Token', 'Value per mode']}
          rows={docs.tokens.map((id) => {
            const t = tokenById.get(id);
            const entries = Object.entries((t?.modes ?? {}) as Record<string, { value: string }>);
            if (entries.length === 0) return [<code>{id}</code>, '—'];
            // Each token can come from a different collection, so list that token's own modes.
            const values = entries.map(([mode, v]) => (
              <div key={mode}>
                {t?.type === 'color' && <span style={s.swatch(v.value)} />}
                <code>{v.value}</code>
                {entries.length > 1 && <span style={{ opacity: 0.7 }}> {mode}</span>}
              </div>
            ));
            return [<code>{id}</code>, <>{values}</>];
          })}
        />
      </Section>

      <Section id="figma" title="Figma mapping">
        <p>
          {docs.figma.url ? <a href={docs.figma.url}>Open component in Figma</a> : 'Figma component not linked yet.'}
        </p>
        <Table
          head={['React prop', 'Figma property', 'Type', 'Values (code → Figma)']}
          rows={Object.entries(docs.figma.properties).map(([prop, m]) => [
            <code>{prop}</code>,
            m.figmaProperty,
            m.type,
            m.values ? Object.entries(m.values).map(([k, v]) => `${k} → ${v}`).join(', ') : '—',
          ])}
        />
      </Section>

      {(docs.related?.length || docs.notes?.length) && (
        <Section id="related" title="Related & notes">
          {docs.related?.length ? <p>Related: {docs.related.join(', ')}</p> : null}
          {docs.notes?.length ? <ul>{docs.notes.map((n) => <li key={n}>{n}</li>)}</ul> : null}
        </Section>
      )}
    </>
  );
}

export function ThemisDocsPage() {
  const { preparedMeta } = useOf('meta', ['meta']);
  const docs = preparedMeta.parameters.themis as ComponentDocs | undefined;

  return (
    <>
      <Title />
      {docs && (
        <p>
          <span style={s.badge(docs.status)}>{docs.status}</span>{' '}
          <span style={{ color: '#6b7280', fontSize: 14 }}>
            {docs.category} · <code>{`import { ${docs.name} } from 'themis-ds'`}</code>
          </span>
        </p>
      )}
      <Subtitle />
      <Description />
      <Primary />
      {docs ? <ThemisSections docs={docs} /> : <p>⚠️ No <code>parameters.themis</code> docs found for this component.</p>}
      <Stories title="Examples" includePrimary={false} />
      <Section id="api" title="API reference">
        <p>All props, including those inherited from React Aria. Themis-specific props are listed first.</p>
        <Controls />
      </Section>
    </>
  );
}
