export function validateCPF(cpf: string) {
  cpf = cpf.replace(/\D/g, '');
  cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4');
  const notIsCPF = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999'
  ];
  const cpfRegex = /^(?:(\d{3}).(\d{3}).(\d{3})-(\d{2}))$/;
  if (!cpfRegex.test(cpf)) {
    return true;
  }

  if (notIsCPF.indexOf(cpf.replace(/\D/g, '')) > -1) {
    return true;
  }

  const numeros = cpf.match(/\d/g)!.map(Number);
  let soma = numeros.reduce((acc: number, cur: number, idx: number) => {
    if (idx < 9) {
      return acc + cur * (10 - idx);
    }
    return acc;
  }, 0);

  let resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) {
    resto = 0;
  }

  if (resto !== numeros[9]) {
    return true;
  }

  soma = numeros.reduce((acc: number, cur: number, idx: number) => {
    if (idx < 10) {
      return acc + cur * (11 - idx);
    }
    return acc;
  }, 0);

  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) {
    resto = 0;
  }

  if (resto !== numeros[10]) {
    return true;
  }

  return false;
}

export function validatePhone(phone: string) {
  phone = phone.replace(/\D/g, '');
  phone = phone.replace(/(\d{2})(\d)/, '($1) $2');
  phone = phone.replace(/(\d)(\d{4})$/, '$1-$2');
  const regex =
    /^\((?:[14689][1-9]|2[12478]|3[1234578]|5[1345]|7[134579])\) (?:[2-8]|9[0-9])[0-9]{3}-[0-9]{4}$/;
  return !regex.test(phone);
}

export function validateName(name: string) {
  const n = name.split(' ');
  if (n.length < 2) {
    return true;
  }
  return false;
}
