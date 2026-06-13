import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

export default function Tabela({
    cabecarios = [],
    cabecarioCor = '',
    dados = [],
    className = '',
    style = {},
    tamanhoPagina,
    titulo = '',
}) {
    const tamanhoPaginaFinal = tamanhoPagina ?? 5;
    const dadosSeguros = Array.isArray(dados) ? dados : [];
    const totalPaginas = Math.max(
        1,
        Math.ceil(dadosSeguros.length / tamanhoPaginaFinal),
    );

    const [paginaAtual, setPaginaAtual] = useState(1);
    const paginaAtualValida = Math.min(paginaAtual, totalPaginas);

    const indiceInicial = (paginaAtualValida - 1) * tamanhoPaginaFinal;
    const dadosPaginados = dadosSeguros.slice(
        indiceInicial,
        indiceInicial + tamanhoPaginaFinal,
    );

    return (
        <div>
            <Table hover className={className} style={style}>
                <thead>
                    {(() => {
                        // calcula o total de colunas levando em conta possíveis colSpan
                        const totalColunas = Array.isArray(cabecarios)
                            ? cabecarios.reduce((sum, h) => {
                                  if (h && typeof h === 'object' && h.colSpan) {
                                      const cs = Number(h.colSpan) || 0;
                                      return sum + (cs > 0 ? cs : 1);
                                  }
                                  return sum + 1;
                              }, 0)
                            : 0;

                        return (
                            <>
                                {titulo && (
                                    <tr>
                                        <th
                                            colSpan={totalColunas}
                                            style={{ textAlign: 'center' }}
                                        >
                                            {titulo}
                                        </th>
                                    </tr>
                                )}
                                <tr>
                                    {cabecarios.map((c, index) => {
                                        const isObj =
                                            c && typeof c === 'object';
                                        const colSpan =
                                            isObj && c.colSpan
                                                ? c.colSpan
                                                : undefined;
                                        const rowSpan =
                                            isObj && c.rowSpan
                                                ? c.rowSpan
                                                : undefined;
                                        const className =
                                            isObj && c.className
                                                ? c.className
                                                : undefined;
                                        const headerStyle = {
                                            background: cabecarioCor,
                                            ...(isObj && c.style
                                                ? c.style
                                                : {}),
                                            ...(isObj &&
                                            c.style &&
                                            c.style.textAlign
                                                ? {}
                                                : { textAlign: 'center' }),
                                        };
                                        const content = isObj
                                            ? c.value ?? c.label ?? ''
                                            : c;

                                        return (
                                            <th
                                                key={`header-${index}`}
                                                style={headerStyle}
                                                colSpan={colSpan}
                                                rowSpan={rowSpan}
                                                className={className}
                                            >
                                                {content}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </>
                        );
                    })()}
                </thead>
                <tbody>
                    {dadosPaginados.map((d, rowIndex) => (
                        <tr key={`row-${rowIndex}`} className="">
                            {d?.map(
                                (c, cellIndex) =>
                                    c && (
                                        <td
                                            key={`cell-${rowIndex}-${cellIndex}`}
                                            style={c?.style}
                                            className={c?.className}
                                        >
                                            {c?.value || c}
                                        </td>
                                    ),
                            )}
                        </tr>
                    ))}
                </tbody>
            </Table>

            {totalPaginas > 1 && (
                <div className="d-flex justify-content-center align-items-center">
                    <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() =>
                            setPaginaAtual((pagina) => Math.max(1, pagina - 1))
                        }
                        disabled={paginaAtualValida === 1}
                    >
                        Anterior
                    </Button>

                    {Array.from({ length: totalPaginas }, (_, index) => {
                        const numeroPagina = index + 1;
                        return (
                            <Button
                                key={`page-${numeroPagina}`}
                                variant={
                                    numeroPagina === paginaAtualValida
                                        ? 'success'
                                        : 'outline-success'
                                }
                                size="sm"
                                className="mx-1"
                                onClick={() => setPaginaAtual(numeroPagina)}
                            >
                                {numeroPagina}
                            </Button>
                        );
                    })}

                    <Button
                        variant="success"
                        size="sm"
                        className="ms-2"
                        onClick={() =>
                            setPaginaAtual((pagina) =>
                                Math.min(totalPaginas, pagina + 1),
                            )
                        }
                        disabled={paginaAtualValida === totalPaginas}
                    >
                        Proximo
                    </Button>
                </div>
            )}
        </div>
    );
}
