import Form from 'react-bootstrap/Form';

export default function Select({
    className,
    grupos: itens = [],
    value = '',
    textFundo = '',
    onChange = () => {},
}) {
    itens = !Array.isArray(itens) ? [] : itens;
    return (
        <>
            <Form.Select
                className={className}
                value={value}
                onChange={onChange}
            >
                <option value="">{textFundo}</option>
                {itens.map((item) => (
                    <option key={item?.id} value={item?.id}>
                        {item.nome
                            ? item.nome
                            : item.name
                              ? item.name
                              : item.username}
                    </option>
                ))}
            </Form.Select>
        </>
    );
}
