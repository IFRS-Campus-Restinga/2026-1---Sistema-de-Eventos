import Form from 'react-bootstrap/Form';

export default function Select({ className, grupos: itens = [], value = '', onChange = () => {} }) {
  return (
    <>
      <Form.Select className={className} value={value} onChange={onChange}>
        <option value="">Selecione um grupo</option>
        {itens.map((item) => (
          <option key={item?.id} value={item?.id}>
            {item.name}
          </option>
        ))}
      </Form.Select>
    </>
  );
}

