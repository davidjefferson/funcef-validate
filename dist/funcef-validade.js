(function () {
    'use strict';
    /**
    * @ngdoc overview
    * @name Validate
    * @version 1.0.0
    * @Componente para validação de formulários
    */
    angular.module('funcef-validate.controller', []);
    angular.module('funcef-validate.service', []);
    angular.module('funcef-validate.component', []);
    angular.module('funcef-validate.directive', []);

    angular
    .module('funcef-validate', [
      'funcef-validate.controller',
      'funcef-validate.service',
      'funcef-validate.component',
      'funcef-validate.directive'
    ]);
})();;(function () {
    'use strict';

    angular.module('funcef-validate.controller')
        .controller('NgfValidateController', NgfValidateController);

    NgfValidateController.$inject = ['$scope', '$timeout'];

    /* @ngInject */
    function NgfValidateController($scope, $timeout) {
        var vm = this;

        vm.messages = {
            default: 'Campo inválido!',
            required: 'Este campo é obrigatório!',
            cpf: 'CPF informado é inválido!',
            cnpj: 'CNPJ informado é inválido!',
            email: 'E-mail informado é inválido!',
            number: 'Número informado é inválido!',
            url: 'URL informada é inválido!',
            date: 'Data informada é inválido!',
            dateTime: 'Data e Hora informados são inválidos!',
            time: 'Hora Informada é inválida!',
            minlength: 'Mínimo {p} caracteres!',
            maxlength: 'Máximo {p} caracteres!',
            mesAno: 'Período informado é invalido!',
            minValue: 'O valor mínimo é {p}!',
            maxValue: 'O valor máximo é {p}!',
            minSelected: 'Selecione no mínimo "{p}" !',
            maxSelected: 'Selecione no máximo "{p}" !'
        };

        vm.functionValidator = {
            cpf: validaCPF,
            cnpj: validaCNPJ,
            email: validaEmail,
            date: validaDate,
            dateTime: validaDatetime,
            time: validaTime,
            number: validaNumber,
            url: validaUrl,
            mesAno: validaMeAno,
            minValue: validaMinValue,
            maxValue: validaMaxValue,
            minSelected: validaMinSelected,
            maxSelected: validaMaxSelected
        };

        vm.options = {
            classMessageError: 'text-danger bg-danger p-5',
            elementError: 'p',
            classError: 'has-error',
            classSuccess: 'has-success'
        };

        vm.attrs = {
            minValue: 'min-value',
            maxValue: 'max-value',
            minSelected: 'min-selected',
            maxSelected: 'max-selected',
            checkAll: 'check-all',
            condition: 'condition'
        };

        init();

        /////////

        function init() {
            $timeout(function () {
                addValidateField();
            }, 1000);
        }

        function addValidateField() {
            angular.forEach($scope.name.$$controls, function (control, key) {
                control.$$element.blur(function (event) {
                    validField(angular.element(event.currentTarget));
                    verifyIndicatorRequired();
                });

                addIndicatorRequired(control);
            });

            $scope.name.$$element.submit(function () {
                angular.forEach($scope.name.$$controls, function (control, key) {
                    validField(angular.element(control.$$element[0]));
                });
            });
        }

        function validField(field) {
            var typeError = existErrorsAngular(field);
            removeValidators(field);

            if (existErrorsRequired(field)) {
                addErrorElement(field, 'required');

            } else if (existErrorsValidatorsAttr(field)) {

            } else if (typeError) {
                addErrorElement(field, typeError);

            } else if (existErrorsMinValue(field)) {
                addErrorElement(field, 'minValue');

            } else if (existErrorsMaxValue(field)) {
                addErrorElement(field, 'maxValue');

            } else if (existErrorsMinSelected(field)) {
                addErrorElement(field, 'minSelected');

            } else if (existErrorsMaxSelected(field)) {
                addErrorElement(field, 'maxSelected');

            } else {
                addSuccessElement(field);
            }
        }

        function validator(type, field) {
            if (type == 'custom') {
                var funct = field.attr(vm.attrs.condition);
                var ctrl = funct.split('.');
                var customValidate = $scope.$parent[ctrl[0]][ctrl[1]];
                return customValidate();

            } else if (vm.functionValidator[type]) {
                return vm.functionValidator[type](field.val(), field);
            }
        }

        function addSuccessElement(field, typeError) {
            if ($scope.name[field.attr('name')].$valid) {
                field.parent().addClass(vm.options.classSuccess);
            }
        }

        function addErrorElement(field, typeError) {
            if (field.next().hasClass('form-validate'))
                return false;

            if (isRadioOrCheckbox(field)) {
                field.parent().parent().parent().addClass(vm.options.classError);
            } else {
                field.parent().addClass(vm.options.classError);
            }

            var mensagem = vm.messages[typeError];

            if (['minlength', 'maxlength'].indexOf(typeError) >= 0) {
                mensagem = mensagem.replace('{p}', field.attr('ng-' + typeError));
            }

            if ('minValue' == typeError) {
                mensagem = mensagem.replace('{p}', field.attr(vm.attrs.minValue));
            }

            if ('maxValue' == typeError) {
                mensagem = mensagem.replace('{p}', field.attr(vm.attrs.maxValue));
            }

            var fieldValid = field;
            if ('minSelected' == typeError) {
                if (isFieldCheckAll(field)) {
                    fieldValid = getElementByCheckAll(vm.attrs.minSelected, field);
                }

                mensagem = mensagem.replace('{p}', fieldValid.attr(vm.attrs.minSelected));
            }

            fieldValid = field;
            if ('maxSelected' == typeError) {
                if (isFieldCheckAll(field)) {
                    fieldValid = getElementByCheckAll(vm.attrs.maxSelected, field);
                }
                mensagem = mensagem.replace('{p}', fieldValid.attr(vm.attrs.maxSelected));
            }

            if (!mensagem) {
                mensagem = vm.messages.default;
            }

            var messageError = '<' + vm.options.elementError + ' class="form-validate ' + vm.options.classMessageError + '">' + mensagem + '</' + vm.options.elementError + '>';

            if (isRadioOrCheckbox(field)) {
                var parent = field.parent().parent();
                angular.element('.form-validate', parent).remove();
                parent.append(messageError);
            } else {
                field.after(messageError);
            }

            setValidityField(field, typeError, false);
        }

        function removeValidators(field) {
            var elementGroup = field.parent();

            if (isRadioOrCheckbox(field)) {
                elementGroup = elementGroup.parent().parent();
            }

            elementGroup.removeClass(vm.options.classError)
                          .removeClass(vm.options.classSuccess);

            if (field.next().hasClass('form-validate')) {
                field.next().remove();
            }

            var validators = field.attr('validator');
            if (validators) {
                var types = validators.split(',');
                angular.forEach(types, function (type) {
                    setValidityField(field, type, true);
                });
            }

            if (isRadioOrCheckbox(field)) {
                var parent = field.parent().parent();
                angular.element('.form-validate', parent).remove();
            }

            angular.forEach(Object.keys(vm.attrs), function (type) {
                setValidityField(field, type, true);
            });
        }

        function setValidityField(field, typeError, value) {
            var name = field.attr('name');
            $scope.name[name].$setValidity(typeError, value);
        }

        function isRadioOrCheckbox(field) {
            return ['radio', 'checkbox'].indexOf(field.attr('type')) >= 0;
        }

        function isFieldCheckAll(field) {
            return field.attr(vm.attrs.checkAll);
        }

        function getElementByCheckAll(attrs, field) {
            return angular.element('[' + attrs + ']', field.parent().parent().parent());
        }

        function addIndicatorRequired(control) {
            if (control.$$attr.id) {
                var element = angular.element('[for="' + control.$$attr.id + '"]');

                if (isRadioOrCheckbox(control.$$element)) {
                    var label = angular.element(control.$$element).parent().parent().prev();
                    if (label.is('label')) {
                        element = label;
                    }
                }

                angular.element('.req', element).remove();

                console.log();

                if (control.$$attr.required || !isNaN(parseInt(control.$$attr.minSelected))) {
                    element.append('<span class="req"> *</span>');
                }
            }
        }

        function verifyIndicatorRequired() {
            angular.forEach($scope.name.$$controls, function (control, key) {
                addIndicatorRequired(control);
            });
        }

        // Valida Exist Errors

        function existErrorsRequired(field) {
            return field.hasClass('ng-invalid-required');
        }

        function existErrorsValidatorsAttr(field) {
            var validators = field.attr('validator');

            if (validators) {
                var types = validators.split(',');
                angular.forEach(types, function (type) {
                    if (!validator(type, field)) {
                        addErrorElement(field, type);
                        return true;
                    }
                });
            }
        }

        function existErrorsAngular(field) {
            if ($scope.name[field.attr('name')].$invalid) {
                var error = $scope.name[field.attr('name')].$error;
                return Object.keys(error)[0];
            }
        }

        function existErrorsMinValue(field) {
            return field.attr(vm.attrs.minValue) && !validator('minValue', field);
        }

        function existErrorsMaxValue(field) {
            return field.attr(vm.attrs.maxValue) && !validator('maxValue', field);
        }

        function existErrorsMinSelected(field) {
            var attr = field.attr(vm.attrs.minSelected);
            var fieldValid = field;

            if (field.attr(vm.attrs.checkAll)) {
                attr = true;
                fieldValid = getElementByCheckAll(vm.attrs.minSelected, field);
            }

            return attr && !validator('minSelected', fieldValid);
        }

        function existErrorsMaxSelected(field) {
            var attr = field.attr(vm.attrs.maxSelected);
            var fieldValid = field;

            if (field.attr(vm.attrs.checkAll)) {
                attr = true;
                fieldValid = getElementByCheckAll(vm.attrs.minSelected, field);
            }

            return attr && !validator('maxSelected', fieldValid);
        }

        // Validações de campos

        function validaCPF(cpf) {
            var blacklist = [
                "00000000000",
                "11111111111",
                "22222222222",
                "33333333333",
                "44444444444",
                "55555555555",
                "66666666666",
                "77777777777",
                "88888888888",
                "99999999999",
                "12345678909",
                "00000000191"
            ];
            var add, rev;

            if (!cpf) return false;

            cpf = cpf.toString();
            cpf = cpf.replace(/[^\d]+/g, '');

            if (cpf === '') return false;

            if (blacklist.indexOf(cpf) > 0) return false;

            // Valida 1º digito
            add = 0;
            for (var i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i); rev = 11 - (add % 11);
            if (rev == 10 || rev == 11) rev = 0;
            if (rev != parseInt(cpf.charAt(9))) return false;

            // Valida 2º digito
            add = 0;

            for (i = 0; i < 10; i++) {
                add += parseInt(cpf.charAt(i)) * (11 - i); rev = 11 - (add % 11);
            }

            if (rev == 10 || rev == 11) {
                rev = 0;
            }

            if (rev != parseInt(cpf.charAt(10))) {
                return false;
            }

            return true;
        }

        function validaCNPJ(cnpj) {
            cnpj = cnpj.replace(/[^\d]+/g, '');

            if (cnpj === '') return false;

            if (cnpj.length != 14)
                return false;

            // Elimina CNPJs invalidos conhecidos
            if (cnpj == "00000000000000" ||
                cnpj == "11111111111111" ||
                cnpj == "22222222222222" ||
                cnpj == "33333333333333" ||
                cnpj == "44444444444444" ||
                cnpj == "55555555555555" ||
                cnpj == "66666666666666" ||
                cnpj == "77777777777777" ||
                cnpj == "88888888888888" ||
                cnpj == "99999999999999")
                return false;

            // Valida DVs
            var tamanho = cnpj.length - 2;
            var numeros = cnpj.substring(0, tamanho);
            var digitos = cnpj.substring(tamanho);
            var soma = 0;
            var pos = tamanho - 7;
            for (var i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0))
                return false;

            tamanho = tamanho + 1;
            numeros = cnpj.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1))
                return false;

            return true;
        }

        function validaEmail(email) {
            var str = email;
            var filtro = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            if (filtro.test(str)) {
                return true;
            } else {
                return false;
            }
        }

        function validaMeAno(periodo) {
            periodo = periodo.split('/');
            if (periodo.length == 2 &&
                (periodo[0].length == 2 && periodo[1].length == 4) &&
                (parseInt(periodo[0]) > 0 && parseInt(periodo[0]) <= 12) &&
                (parseInt(periodo[1]) > 999 && parseInt(periodo[1]) <= 9999)) {
                return true;
            } else {
                return false;
            }
        }

        function validaDate(data) {
            /* @TODO - Amarrado a um único formato dd/mm/yyyy */
            var isoDateRe = new RegExp("^([0-9]{2})/([0-9]{2})/([0-9]{4})$");
            var matches = isoDateRe.exec(data);

            if (!matches) {
                return false;
            }

            var cDate = new Date(matches[3], (matches[2] - 1), matches[1]);

            var result = ((cDate.getDate() == matches[1]) &&
                          (cDate.getMonth() == (matches[2] - 1)) &&
                          (cDate.getFullYear() == matches[3]));

            return result;
        }

        function validaTime(time) {
            time = time.split(':');
            if (time.length >= 2) {
                if (time[0] === '' || time[0].length < 2 || parseInt(time[0]) >= 24) {
                    return false;
                }

                if (time[1] === '' || time[1].length < 2 || parseInt(time[1]) >= 60 || time[0] < 0) {
                    return false;
                }

                return true;
            }
        }

        function validaDatetime(datatime) {
            datatime = datatime.split(' ');
            if (datatime.length == 2) {
                return validaDate(datatime[0]) && validaTime(datatime[1]);
            }
        }

        function validaNumber(number) {
            number = number.replace(/\./g, '');
            number = number.replace(/,/g, '.');
            return !isNaN(parseFloat(number)) && isFinite(number);
        }

        function validaUrl(url) {
            var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if (!regex.test(url)) {
                return false;
            } else {
                return true;
            }
        }

        function validaMinValue(valor, field) {
            return parseInt(valor) >= parseInt(field.attr(vm.attrs.minValue));
        }

        function validaMaxValue(valor, field) {
            return parseInt(valor) <= parseInt(field.attr(vm.attrs.maxValue));
        }

        function validaMinSelected(valor, field) {
            var min = parseInt(field.attr(vm.attrs.minSelected));
            var selecteds = angular.element(':checked', field.parent().parent()).length;
            return selecteds >= min;
        }

        function validaMaxSelected(valor, field) {
            var max = parseInt(field.attr(vm.attrs.maxSelected));
            var selecteds = angular.element(':checked', field.parent().parent()).length;
            return selecteds <= max;
        }
    }
}());;(function () {
    'use strict';

    angular
      .module('funcef-validate.directive')
      .directive('ngfValidate', NgfValidate);

    NgfValidate.$inject = ['$timeout'];

    /* @ngInject */
    function NgfValidate($timeout) {
        return {
            restrict: 'A',
            controller: 'NgfValidateController',
            controllerAs: 'vm',
            require: [
                '^name',
                '^model'
            ],
            scope: {
                name: '=',
                model: '='
            }
        };
    }
}());