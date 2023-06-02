import fetchWithPin from './fetch'
import type {
    User,
    Server,
    DataUsageByUser,
    ServerMetrics,
    HttpRequest,
    Options
} from "./types"

class OutlineVPN {
    apiUrl: string
    fingerprint: string
    timeout?: number
    constructor(options: Options) {
        this.apiUrl = options.apiUrl
        this.fingerprint = options.fingerprint
        this.timeout = options.timeout
    }

    private async fetch(req: HttpRequest) {
        return await fetchWithPin(req, this.fingerprint, this.timeout)
    }

    public async getServer(): Promise<Server | null> {
        const response = await this.fetch({ url: `${this.apiUrl}/server`, method: 'GET' })
        if (response !== null) {
            if(response.ok) {
                const json = JSON.parse(response.body)
                return json
            }
        }
        return null
    }

    public async renameServer(name: string): Promise<boolean | null> {
        const response = await this.fetch({
            url: `${this.apiUrl}/name`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })
        if (response !== null) {
            return response.ok
        }
        return null
    }

    public async setDefaultDataLimit(bytes: number): Promise<boolean | null> {
        const response = await this.fetch({
            url: `${this.apiUrl}/server/access-key-data-limit`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: { bytes } })
        })
        if (response !== null) {
            return response.ok
        }
        return null
    }

    public async deleteDefaultDataLimit(): Promise<boolean | null> {
        const response = await this.fetch({ url: `${this.apiUrl}/server/access-key-data-limit`,
            method: 'DELETE'
        })
        if (response !== null) {
            return response.ok
        }
        return null
    }

    public async setHostnameForAccessKeys(hostname: string): Promise<boolean | null> {
        const response = await this.fetch({ url: `${this.apiUrl}/server/hostname-for-access-keys`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hostname })
        })
        if (response !== null) {
            return response.ok
        }
        return null
    }

    public async setPortForNewAccessKeys(port: number): Promise<boolean | null> {
        const response = await this.fetch({ url: `${this.apiUrl}/server/port-for-new-access-keys`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ port })
        })
        if (response !== null) {
            return response.ok
        }
        return null
    }

    public async getDataUsage(): Promise<DataUsageByUser | false | null> {
        const response = await this.fetch({ url: `${this.apiUrl}/metrics/transfer`, method: 'GET' })
        if (response !== null) {
            let data: DataUsageByUser | false = false
            if(response.ok) {
                try {
                    const json = JSON.parse(response.body)
                    data = json
                } catch (err) {
                    console.error(err)
                }
            }
            return data
        }
        return null
    }

    public async getDataUserUsage(id: string): Promise<number | null> {
        const response = await this.getDataUsage()
        if (response) {
            const { bytesTransferredByUserId } = response
            const userUsage = bytesTransferredByUserId[id]
            if(userUsage) {
                return userUsage
            }
        }
        return null
    }

    public async getShareMetrics(): Promise<ServerMetrics | false | null> {
        const response = await this.fetch({ url: `${this.apiUrl}/metrics/enabled`, method: 'GET' })
        if (response !== null) {
            let data: ServerMetrics | false = false
            if(response.ok) {
                try {
                    const json = JSON.parse(response.body)
                    data = json
                } catch (err) {
                    console.log(err)
                }
            }
            return data
        }
        return null
    }

    public async setShareMetrics(metricsEnabled: boolean): Promise<boolean | null> {
        const response = await this.fetch({ url: `${this.apiUrl}/metrics/enabled`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ metricsEnabled })
        })

        if (response !== null) {
            let data = false
            if(response.ok) {
                try {
                    const json = JSON.parse(response.body)
                    data = json
                } catch (err) {
                    console.error(err)
                }
            }
            return data
        }
        return null
    }

    public async getUsers(): Promise<User[] | false | null> {
        const response = await this.fetch({ url: `${this.apiUrl}/access-keys`, method: 'GET' })

        if (response !== null) {
            let data: User[] | false = false
            if(response.ok) {
                try {
                    const { accessKeys } = JSON.parse(response.body)
                    data = accessKeys
                } catch (err) {
                    console.error(err)
                }
            }
            return data
        }
        return null
    }

    public async getUser(id: string): Promise<User | false | null> {
        const response = await this.fetch({url: `${this.apiUrl}/access-keys/${id}`, method: 'GET'})
        if (response !== null) {
            let data: User | false = false
            if(response.ok) {
                try {
                    const json = JSON.parse(response.body)
                    data = json
                } catch (err) {
                    console.error(err)
                }
            }
            return data
        }
        return null
    }

    public async createUser(): Promise<User | false | null> {
        const response = await this.fetch({
            url: `${this.apiUrl}/access-keys`,
            method: 'POST'
        })

        if (response !== null) {
            let data: User | false = false
            if(response.ok) {
                try {
                    const json = JSON.parse(response.body)
                    data = json
                } catch (err) {
                    console.error(err)
                }
            }
            return data
        }
        return null
    }

    public async deleteUser(id: string): Promise<boolean | null> {
        const response = await this.fetch({
            url: `${this.apiUrl}/access-keys/${id}`,
            method: 'DELETE'
        })
        if (response !== null) {
            return response.ok
        }
        return null
    }

    public async renameUser(id: string, name: string): Promise<boolean | null> {
        const response = await this.fetch({
            url: `${this.apiUrl}/access-keys/${id}/name`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })
        if (response !== null) {
            return response.ok
        }
        return null
    }

    public async addDataLimit(id: string, bytes: number): Promise<boolean | null> {
        const response = await this.fetch({
            url: `${this.apiUrl}/access-keys/${id}/data-limit`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: { bytes } })
        })

        if (response !== null) {
            return response.ok
        }
        return null
    }

    public async deleteDataLimit(id: string): Promise<boolean | null> {
        const response = await this.fetch({
            url: `${this.apiUrl}/access-keys/${id}/data-limit`,
            method: 'DELETE'
        })
        if (response !== null) {
            return response.ok
        }
        return null
    }

    public async disableUser(id: string): Promise<boolean | null> {
        return await this.addDataLimit(id, 0)
    }

    public async enableUser(id: string): Promise<boolean | null> {
        return await this.deleteDataLimit(id)
    }

}

export { OutlineVPN };