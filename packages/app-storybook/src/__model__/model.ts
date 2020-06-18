//
// Copyright © 2020 Anticrm Platform Contributors.
// 
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// 
// See the License for the specific language governing permissions and
// limitations under the License.
//

import contact from '@anticrm/contact'
import Builder from '@anticrm/platform-core/src/__model__/builder'

import { Ref, Property } from '@anticrm/platform-core'
import { Account, User } from '@anticrm/platform-business'

function str (s: string): Property<string> { return s as unknown as Property<string> }

export default async (S: Builder) => {

  S.createDocument(contact.class.Person, {
    onBehalfOf: '' as unknown as Ref<User>,
    createdBy: '' as unknown as Ref<Account>,
    createdOn: '12 May 2020' as unknown as Property<Date>,
    firstName: str('Andrey'),
    lastName: str('Platov'),
    // birthDate: str('1 May 1976'),
    email: str('andrey.v.platov@gmail.com')
  })

  S.createDocument(contact.class.Person, {
    onBehalfOf: '' as unknown as Ref<User>,
    createdBy: '' as unknown as Ref<Account>,
    createdOn: '12 May 2020' as unknown as Property<Date>,
    firstName: str('Andrey'),
    lastName: str('Sobolev'),
    email: str('haiodo@gmail.com')
  })


}